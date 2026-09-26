import * as service from './auth.service.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE = 'refresh_token';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function register(req, res) {
  const user = await service.registerUser(req.body);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const { user, accessToken, refreshToken } = await service.loginUser(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  res.json({ user, accessToken });
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  const { accessToken, refreshToken } = await service.rotateRefreshToken(token);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  res.json({ accessToken });
}

export async function logout(req, res) {
  await service.logoutUser(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ ok: true });
}

export async function me(req, res) {
  res.json({ user: req.user });
}