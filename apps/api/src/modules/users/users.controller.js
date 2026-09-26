import * as service from './users.service.js';

export async function getMe(req, res) { res.json({ user: req.user }); }
export async function updateMe(req, res) {
  const user = await service.updateMe(req.user.id, req.body);
  res.json({ user });
}
export async function list(req, res) {
  const result = await service.listUsers(req.query);
  res.json(result);
}
export async function getById(req, res) {
  const user = await service.getUser(req.params.id);
  res.json({ user });
}
export async function patchRole(req, res) {
  const user = await service.changeRole(req.user.id, req.params.id, req.body.role);
  res.json({ user });
}
export async function patchActive(req, res) {
  const user = await service.setActive(req.user.id, req.params.id, req.body.isActive);
  res.json({ user });
}