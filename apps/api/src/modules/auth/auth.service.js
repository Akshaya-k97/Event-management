import { randomBytes, createHash } from 'crypto';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { signAccessToken, signRefreshToken } from '../../lib/jwt.js';

const PUBLIC_USER = {
  id: true, email: true, fullName: true, role: true,
  studentId: true, department: true, avatarUrl: true,
  createdAt: true,
};

const hashToken = (t) => createHash('sha256').update(t).digest('hex');

function refreshExpiryDate() {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function registerUser(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      fullName: input.fullName,
      studentId: input.studentId || null,
      department: input.department || null,
      role: 'STUDENT',
    },
    select: PUBLIC_USER,
  });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive) throw new AppError(401, 'Invalid credentials');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
    },
  });

  const publicUser = await prisma.user.findUnique({
    where: { id: user.id }, select: PUBLIC_USER,
  });

  return { user: publicUser, accessToken, refreshToken };
}

export async function rotateRefreshToken(oldToken) {
  const { verifyRefreshToken, signAccessToken, signRefreshToken } = await import('../../lib/jwt.js');
  let payload;
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(oldToken) },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired or revoked');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new AppError(401, 'Invalid session');

  // rotation: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(refreshToken) },
  });
}

// best-effort cleanup helper (call from cron later)
export async function pruneExpiredRefreshTokens() {
  await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}

export { randomBytes };