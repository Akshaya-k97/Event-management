import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError(401, 'Not authenticated');

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, email: true, fullName: true, role: true,
        studentId: true, department: true, isActive: true,
      },
    });
    if (!user || !user.isActive) throw new AppError(401, 'Invalid session');

    req.user = user;
    next();
  } catch (e) {
    next(e instanceof AppError ? e : new AppError(401, 'Invalid or expired token'));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role))
    return next(new AppError(403, 'Insufficient permissions'));
  next();
};