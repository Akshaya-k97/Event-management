# Phase 1 Manual Smoke Test

1. Start stack: `npm run setup`, then `npm run dev:api`.
2. Health check:
       curl http://localhost:3000/api/health
   Expect: `{ "ok": true, ... }`

3. Register:
       curl -X POST http://localhost:3000/api/auth/register \
         -H "Content-Type: application/json" \
         -d '{"email":"new@unisphere.edu","password":"Password123!","fullName":"New Student"}'
   Expect: 201 + user object (no passwordHash).

4. Duplicate register → 409.

5. Login:
       curl -i -X POST http://localhost:3000/api/auth/login \
         -H "Content-Type: application/json" \
         -d '{"email":"admin@unisphere.edu","password":"Password123!"}'
   Expect: 200, `{ accessToken }`, and `Set-Cookie: refresh_token=...`

6. Me (replace <TOKEN>):
       curl http://localhost:3000/api/users/me -H "Authorization: Bearer <TOKEN>"
   Expect: user JSON.

7. RBAC: `GET /api/users` with STUDENT token → 403.
          `GET /api/users` with ADMIN token   → 200.

8. Refresh (uses the cookie jar):
       curl -i -c jar.txt -b jar.txt http://localhost:3000/api/auth/refresh -X POST
   Expect: new accessToken.

9. Logout clears cookie: `POST /api/auth/logout` → 200.