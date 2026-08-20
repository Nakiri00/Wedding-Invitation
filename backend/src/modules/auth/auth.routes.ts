import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { prisma } from '../../lib/prisma.js';
import {
  createAccessToken,
  verifyPassword,
  verifyAccessToken,
} from '../../lib/security.js';
import { env } from '../../config/env.js';
import { loginSchema } from './auth.schema.js';
import {
  AUTH_COOKIE,
  clearAuthCookie,
  getCookie,
  issueCsrfToken,
  setAuthCookie,
} from '../../lib/cookies.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
  },
});

authRouter.get('/csrf', (_request, response) => {
  const csrfToken = issueCsrfToken(response);

  response.json({
    data: {
      ready: true,
      csrfToken,
    },
  });
});

authRouter.post('/login', loginLimiter, async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: {
        email: input.email.toLowerCase(),
      },
    });

    if (
      !user ||
      !(await verifyPassword(input.password, user.passwordHash))
    ) {
      response.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Email atau password salah.',
      });
      return;
    }

    const token = createAccessToken(
      {
        sub: user.id,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
    );

    setAuthCookie(response, token);

    const csrfToken = issueCsrfToken(response);

    response.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', async (request, response) => {
  const token = getCookie(request, AUTH_COOKIE);
  const user = token
    ? verifyAccessToken(token, env.JWT_SECRET)
    : null;

  if (!user) {
    response.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Sesi tidak valid atau sudah kedaluwarsa.',
    });
    return;
  }

  response.json({
    data: {
      user: {
        id: user.sub,
        name: user.name,
        role: user.role,
      },
    },
  });
});

authRouter.post('/logout', (_request, response) => {
  clearAuthCookie(response);

  response.json({
    data: {
      success: true,
    },
  });
});