import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function notFound(_req, _res, next) {
  next(new AppError(404, 'Route not found'));
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const body = {
    error: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
  };
  if (!env.isProd && status >= 500) {
    body.stack = err.stack;
  }
  if (status >= 500) console.error(err);
  res.status(status).json(body);
}