import { Router } from 'express';
import * as c from './users.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  updateMeSchema, changeRoleSchema, setActiveSchema, listUsersQuerySchema,
} from './users.schemas.js';

const router = Router();

router.get('/me',   requireAuth, asyncHandler(c.getMe));
router.patch('/me', requireAuth, validate(updateMeSchema), asyncHandler(c.updateMe));

router.get('/',            requireAuth, requireRole('ADMIN'),
  validate(listUsersQuerySchema, 'query'), asyncHandler(c.list));
router.get('/:id',         requireAuth, requireRole('ADMIN'), asyncHandler(c.getById));
router.patch('/:id/role',  requireAuth, requireRole('ADMIN'),
  validate(changeRoleSchema), asyncHandler(c.patchRole));
router.patch('/:id/status',requireAuth, requireRole('ADMIN'),
  validate(setActiveSchema), asyncHandler(c.patchActive));

export default router;