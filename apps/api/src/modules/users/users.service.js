import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword } from '../../lib/password.js';

const PUBLIC_USER = {
  id: true, email: true, fullName: true, role: true,
  studentId: true, department: true, avatarUrl: true,
  isActive: true, createdAt: true, updatedAt: true,
};

export async function listUsers({ role, q, limit = 50, offset = 0 }) {
  const where = {};
  if (role) where.role = role;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { fullName: { contains: q, mode: 'insensitive' } },
    ];
  }
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where, select: PUBLIC_USER,
      take: Math.min(limit, 100), skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { total, items };
}

export async function getUser(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function updateMe(userId, patch) {
  const data = {};
  if (patch.fullName) data.fullName = patch.fullName;
  if (patch.department !== undefined) data.department = patch.department;
  if (patch.studentId !== undefined) data.studentId = patch.studentId || null;
  if (patch.password) data.passwordHash = await hashPassword(patch.password);
  return prisma.user.update({ where: { id: userId }, data, select: PUBLIC_USER });
}

export async function changeRole(adminId, userId, role) {
  const user = await prisma.user.update({
    where: { id: userId }, data: { role }, select: PUBLIC_USER,
  });
  await prisma.auditLog.create({
    data: {
      actorId: adminId, action: 'user.role.change',
      entityType: 'User', entityId: userId, metadata: { role },
    },
  });
  return user;
}

export async function setActive(adminId, userId, isActive) {
  const user = await prisma.user.update({
    where: { id: userId }, data: { isActive }, select: PUBLIC_USER,
  });
  await prisma.auditLog.create({
    data: {
      actorId: adminId, action: 'user.status.change',
      entityType: 'User', entityId: userId, metadata: { isActive },
    },
  });
  return user;
}