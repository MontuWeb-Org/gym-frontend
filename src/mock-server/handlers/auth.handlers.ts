import { http, HttpResponse } from "msw";
import { mockDb, MockUser, MockUserRole } from "../db";

async function parseRequestBody(request: Request) {
  try {
    const raw = await request.json();
    return raw?.body?.data || raw?.data || raw || {};
  } catch {
    return {};
  }
}

// Helper to extract userId from "Bearer mock_jwt_{userId}_{timestamp}"
function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 3 ? parts[2] : null;
}

// Helper to extract userId from cookie header
function getUserIdFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/refreshToken=mock_refresh_([^_]+)_/);
  return match ? match[1] : null;
}

export const authHandlers = [
  // 1. Register Init
  http.post("*/api/auth/register/init", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { email, password, name, phoneNumber } = body;

    if (!email || !password) {
      return HttpResponse.json(
        { message: "Validation Error", errors: { email: ["Email is required"] } },
        { status: 422 }
      );
    }

    const existingUser = mockDb.users.find((u) => u.email === email);
    if (existingUser) {
      return HttpResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const creationToken = `mock_token_${Date.now()}`;

    mockDb.pendingRegistrations.set(creationToken, {
      name: name || "New User",
      email,
      phoneNumber: phoneNumber || "",
      password,
    });

    return HttpResponse.json({
      data: { creationToken },
    });
  }),

  // 2. Register Complete
  http.post("*/api/auth/register/complete", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { otp, creationToken } = body;

    if (!creationToken || !otp) {
      return HttpResponse.json(
        { message: "Creation token and OTP are required" },
        { status: 422 }
      );
    }

    const pendingData = mockDb.pendingRegistrations.get(creationToken);
    if (!pendingData) {
      return HttpResponse.json(
        { message: "Invalid or expired creation token" },
        { status: 400 }
      );
    }

    const newUser: MockUser = {
      id: mockDb.users.length + 1,
      email: pendingData.email,
      name: pendingData.name,
      phoneNumber: pendingData.phoneNumber,
      password: pendingData.password,
      role: MockUserRole.TRAINER,
      activationStatus: "ACTIVATED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.users.push(newUser);
    mockDb.pendingRegistrations.delete(creationToken);

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_${newUser.id}_${Date.now()}`,
          user: {
            id: String(newUser.id),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `refreshToken=mock_refresh_${newUser.id}_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 3. Login
  http.post("*/api/auth/login", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { email, password } = body;

    const user = mockDb.users.find((u) => u.email === email);

    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_${user.id}_${Date.now()}`,
          user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `refreshToken=mock_refresh_${user.id}_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 4. Forgot Password Init
  http.post("*/api/auth/forgot/init", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { email } = body;

    if (!email) {
      return HttpResponse.json(
        { message: "Email is required" },
        { status: 422 }
      );
    }

    const user = mockDb.users.find((u) => u.email === email);
    if (!user) {
      return HttpResponse.json(
        { message: "User with this email does not exist" },
        { status: 404 }
      );
    }

    const verificationToken = `mock_reset_token_${Date.now()}`;
    mockDb.pendingPasswordResets.set(verificationToken, { email });

    return HttpResponse.json({
      data: { verificationToken },
    });
  }),

  // 5. Forgot Password Complete
  http.post("*/api/auth/forgot/complete", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { otp, verificationToken, newPassword } = body;

    if (!verificationToken || !otp || !newPassword) {
      return HttpResponse.json(
        { message: "Verification token, OTP, and new password are required" },
        { status: 422 }
      );
    }

    const resetData = mockDb.pendingPasswordResets.get(verificationToken);
    if (!resetData) {
      return HttpResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = mockDb.users.find((u) => u.email === resetData.email);
    if (user) {
      user.password = newPassword;
      user.updatedAt = new Date().toISOString();
    }

    mockDb.pendingPasswordResets.delete(verificationToken);

    const userId = user ? user.id : 1;

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_${userId}_${Date.now()}`,
          user: user
            ? {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `refreshToken=mock_refresh_${userId}_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 6. Refresh Token
  http.post("*/api/auth/refresh", async ({ request }) => {
    const userId = getUserIdFromCookie(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Unauthorized: Refresh token expired or invalid." },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_${userId}_${Date.now()}`,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `refreshToken=mock_refresh_${userId}_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

 // 7. Logout
  http.post("*/api/auth/logout", async () => {
    return HttpResponse.json(
      { message: "Logout successfully." },
      {
        status: 200,
        headers: {
          "Set-Cookie": "refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        },
      }
    );
  }),

  // 8. Get Current User
  http.get("*/api/users/me", async ({ request }) => {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return HttpResponse.json(
        { message: "Unauthorized access token" },
        { status: 401 }
      );
    }

    const mockUser = mockDb.users.find((u) => String(u.id) === String(userId));

    if (!mockUser) {
      return HttpResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phoneNumber: mockUser.phoneNumber,
        bio: "Certified Fitness Trainer",
        experience: "5+ Years",
        role: mockUser.role,
      },
    });
  }),

  // 9. Invite Trainee Init
  http.post("*/api/auth/invite/init", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { email } = body;

    if (!email) {
      return HttpResponse.json(
        {
          message: "Validation Error",
          errors: { email: ["Email is required"] },
        },
        { status: 422 }
      );
    }

    return HttpResponse.json(
      { message: "Trainee registration initialized successfully." },
      { status: 201 }
    );
  }),
];