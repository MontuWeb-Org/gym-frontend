import { http, HttpResponse } from "msw";
import { mockDb, MockUser } from "../db";

async function parseRequestBody(request: Request) {
  try {
    const raw = await request.json();
    return raw?.body?.data || raw?.data || raw || {};
  } catch {
    return {};
  }
}

export const authHandlers = [
  // 1. Register Init: Save pending registration details
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
    
    // Save pending registration details in memory
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

  // 2. Register Complete: Move pending user into active users list
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

    // Create new active user object
    const newUser: MockUser = {
      id: mockDb.users.length + 1,
      email: pendingData.email,
      name: pendingData.name,
      phoneNumber: pendingData.phoneNumber,
      password: pendingData.password, // Plain text for mock validation
      role: "TRAINER",
      activationStatus: "ACTIVATED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save user to in-memory array & remove from pending
    mockDb.users.push(newUser);
    mockDb.pendingRegistrations.delete(creationToken);

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_access_token_${Date.now()}`,
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
          "Set-Cookie": `refreshToken=mock_refresh_token_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 3. Login: Authenticate against generated + newly registered users
  http.post("*/api/auth/login", async ({ request }) => {
    const body = await parseRequestBody(request);
    const { email, password } = body; // `password` contains SHA-256 hash string

    const user = mockDb.users.find((u) => u.email === email);

    // Compare incoming SHA-256 string directly with saved user.password
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_${Date.now()}`,
          user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
    );
  }),

  // 4. Refresh Token
  http.post("*/api/auth/refresh", async ({ request }) => {
    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_refreshed_jwt_access_token_${Date.now()}`,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `refreshToken=mock_refreshed_cookie_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 5. Logout
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
];