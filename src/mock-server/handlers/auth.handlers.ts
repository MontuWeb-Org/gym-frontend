import { http, HttpResponse } from 'msw';

// Helper to safely extract payload fields whether flat or nested in `data`/`body`
async function parseRequestBody(request: Request) {
  try {
    const raw = await request.json();
    return raw?.body?.data || raw?.data || raw || {};
  } catch {
    return {};
  }
}

export const authHandlers = [
  // 1. Register Init
  http.post('*/api/auth/register/init', async ({ request }) => {
    const body = await parseRequestBody(request);
    const { email, password, name, phoneNumber } = body;

    if (!email || !password) {
      return HttpResponse.json(
        { message: 'Validation Error', errors: { email: ['Email is required'] } },
        { status: 422 }
      );
    }

    if (email === 'exists@gym.com') {
      return HttpResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      data: {
        creationToken: `mock_creation_token_${Date.now()}`,
      },
    });
  }),

  // 2. Register Complete
  http.post('*/api/auth/register/complete', async ({ request }) => {
    const body = await parseRequestBody(request);
    const { otp, creationToken } = body;

    if (!creationToken || !otp) {
      return HttpResponse.json(
        { message: 'Creation token and OTP are required' },
        { status: 422 }
      );
    }

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_access_token_${Date.now()}`,
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `refreshToken=mock_refresh_token_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 3. Refresh Token
  http.post('*/api/auth/refresh', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader && !request.headers.get('cookie')?.includes('refreshToken')) {
      return HttpResponse.json(
        { message: 'Unauthorized or missing refresh token' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_refreshed_jwt_access_token_${Date.now()}`,
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `refreshToken=mock_refreshed_cookie_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 4. Login
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await parseRequestBody(request);
    const { identifier, password } = body;

    if (!identifier || !password) {
      return HttpResponse.json(
        { message: 'Identifier and password are required' },
        { status: 422 }
      );
    }

    if (password === 'wrong_password') {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const role = identifier.includes('trainee') ? 'trainee' : 'trainer';
    
    // Capitalize all segments of the email prefix (e.g., alex.johnson -> Alex Johnson)
    const baseName = identifier.split('@')[0] || 'Alex Johnson';
    const fullName = baseName
      .split(/[._-]/)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return HttpResponse.json(
      {
        data: {
          accessToken: `mock_jwt_access_token_${Date.now()}`,
          user: {
            id: 'usr_' + Date.now(),
            name: fullName,
            email: identifier,
            role: role,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `refreshToken=mock_refresh_token_${Date.now()}; HttpOnly; Path=/; SameSite=Lax`,
        },
      }
    );
  }),

  // 5. Logout
  http.post('*/api/auth/logout', async () => {
    return HttpResponse.json(
      {
        message: 'Logout successfully.',
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
        },
      }
    );
  }),
];