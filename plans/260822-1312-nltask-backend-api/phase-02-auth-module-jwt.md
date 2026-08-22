---
title: "Phase 2: Auth Module (JWT)"
status: todo
---

# Phase 2: Auth Module (JWT)

## Overview

- Priority: P1
- Status: Pending
- Login/refresh/logout/me + middleware verify JWT dùng chung cho mọi route sau. Bootstrap
  admin đầu tiên lúc server boot.

## Key Insights

- Không có endpoint self-register (theo yêu cầu: chỉ admin thêm user). `POST /api/auth/login`
  là điểm vào duy nhất công khai.
- Access token ngắn hạn (15p) chỉ chứa `{sub: userId, role}`, không query DB mỗi request để
  lấy role — nhưng vẫn cần kiểm tra user còn tồn tại/chưa bị xoá ở middleware nếu cần
  strict (đủ dùng: verify JWT signature + hạn; check user tồn tại chỉ cần ở route nhạy cảm
  hoặc bỏ qua vì access token sống ngắn 15p).
- Refresh token: random string, lưu **hash** (sha256) trong bảng `refresh_tokens`, trả token
  gốc (không hash) cho client. Khi refresh: lookup theo hash, check `revokedAt is null` và
  `expiresAt > now`, rotate (revoke token cũ, issue token mới) để giảm rủi ro replay.
- Reset password (phase 3, do admin gọi) phải revoke toàn bộ refresh token của user đó —
  implement hàm `revokeAllUserTokens(userId)` ở đây để phase 3 tái sử dụng.

## Requirements

- [x] `POST /api/auth/login` — body `{email, password}` → `{accessToken, refreshToken, user}`
- [x] `POST /api/auth/refresh` — body `{refreshToken}` → `{accessToken, refreshToken}` (rotate)
- [x] `POST /api/auth/logout` — body `{refreshToken}` → revoke token đó, 204
- [x] `GET /api/auth/me` — cần access token → trả thông tin user hiện tại (id/email/name/role)
- [x] Middleware `auth-middleware.js` verify Bearer access token, gắn `req.user = {id, role}`
- [x] Bootstrap admin lúc `server.js` start

## Architecture

```
src/
├── middleware/
│   └── auth-middleware.js
├── utils/
│   ├── jwt-utils.js          # sign/verify access + refresh, hash refresh token
│   └── password-utils.js     # bcrypt hash/compare
├── routes/
│   └── auth-routes.js
├── controllers/
│   └── auth-controller.js
├── services/
│   └── auth-service.js       # login, refresh, logout, revokeAllUserTokens
└── bootstrap/
    └── bootstrap-admin.js    # tạo admin nếu chưa có, gọi từ server.js
```

## Related Code Files

**Tạo mới:**
- `backend/src/utils/jwt-utils.js`
- `backend/src/utils/password-utils.js`
- `backend/src/middleware/auth-middleware.js`
- `backend/src/services/auth-service.js`
- `backend/src/controllers/auth-controller.js`
- `backend/src/routes/auth-routes.js`
- `backend/src/bootstrap/bootstrap-admin.js`

**Sửa:**
- `backend/src/app.js` — mount `app.use('/api/auth', authRoutes)`
- `backend/src/server.js` — gọi `bootstrapAdmin()` trước `app.listen`

## Implementation Steps

1. `jwt-utils.js`: `signAccessToken({id, role})`, `verifyAccessToken(token)`,
   `generateRefreshToken()` (random 48 byte hex), `hashToken(token)` (sha256 hex, dùng để
   lookup DB mà không lưu token gốc).
2. `password-utils.js`: `hashPassword(plain)` (bcrypt, saltRounds=10),
   `comparePassword(plain, hash)`.
3. `auth-service.js`:
   - `login(email, password)`: tìm user theo email, compare password, nếu sai → throw lỗi 401
     chung chung ("Email hoặc mật khẩu không đúng" — không tiết lộ email tồn tại hay không).
     Tạo access token + refresh token, lưu refresh token hash vào DB (`expiresAt` = now +
     `JWT_REFRESH_EXPIRES_IN`).
   - `refresh(refreshToken)`: hash input, tìm record, check hợp lệ, revoke record cũ
     (`revokedAt=now`), tạo cặp token mới, lưu record mới. Nếu token không hợp lệ/hết hạn/đã
     revoke → 401.
   - `logout(refreshToken)`: hash input, set `revokedAt=now` nếu tìm thấy (idempotent, không
     lỗi nếu không tìm thấy).
   - `revokeAllUserTokens(userId)`: update nhiều `revokedAt=now` where `userId` và
     `revokedAt is null` — export để phase 3 (reset password/xoá user) gọi lại.
4. `auth-middleware.js`: đọc header `Authorization: Bearer <token>`, verify bằng
   `verifyAccessToken`, nếu hợp lệ gắn `req.user = {id, role}` rồi `next()`, nếu không → 401
   JSON `{error: 'Unauthorized'}`.
5. `auth-controller.js` + `auth-routes.js`: map 4 endpoint, dùng `zod` validate body
   (`email` format, `password` string non-empty), controller mỏng — chỉ gọi service + format
   response, không chứa business logic.
6. `bootstrap-admin.js`: `async function bootstrapAdmin()` — `prisma.user.count({where:{role:'ADMIN'}})`,
   nếu 0 → tạo user role ADMIN từ `ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NAME` (hash password), log
   ra console dòng thông báo đã tạo admin (không log password). Idempotent — chạy lại không
   tạo trùng vì check email unique trước (hoặc bắt lỗi unique constraint và bỏ qua).
7. Gọi `bootstrapAdmin()` trong `server.js` trước `app.listen`.

## Todo

- [x] `jwt-utils.js`, `password-utils.js`
- [x] `auth-middleware.js`
- [x] `auth-service.js` (login/refresh/logout/revokeAllUserTokens)
- [x] `auth-controller.js`, `auth-routes.js`, mount vào `app.js`
- [x] `bootstrap-admin.js`, gọi trong `server.js`

## Success Criteria

- Login đúng email/password → nhận accessToken + refreshToken hợp lệ
- Login sai password → 401
- `GET /api/auth/me` không có token → 401; có token hợp lệ → trả đúng user
- `POST /api/auth/refresh` với refresh token cũ (đã dùng 1 lần) → 401 (rotate hoạt động đúng)
- Server boot lần đầu (DB rỗng) → tự tạo admin, log xác nhận; boot lần 2 → không tạo trùng

## Risk Assessment

- **Rủi ro:** JWT secret yếu/mặc định bị dùng production. **Giảm thiểu:** `env-config.js`
  (phase 1) throw lỗi nếu secret rỗng hoặc bằng đúng giá trị placeholder trong `.env.example`.

## Security Considerations

- Password không bao giờ log ra console/response.
- Refresh token lưu dạng hash (sha256), không lưu plaintext trong DB — nếu DB leak, token
  không tái sử dụng được trực tiếp.
- Thông báo lỗi login không phân biệt "email không tồn tại" vs "sai password" (chống user
  enumeration).

## Next Steps

- Phase 3 (Users module) dùng `auth-middleware` + thêm `require-admin-middleware`, và gọi
  `revokeAllUserTokens` khi admin reset password / xoá user.
- Phase 4-6 dùng `auth-middleware` để lấy `req.user.id` cho scoping dữ liệu.
