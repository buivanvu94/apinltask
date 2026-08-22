---
title: "Phase 3: Users Module (RBAC)"
status: todo
---

# Phase 3: Users Module (RBAC)

## Overview

- Priority: P1
- Status: Pending
- Module quản lý user chỉ dành cho ADMIN: list, create, reset password, delete. Thêm
  middleware RBAC dùng chung. User role USER gọi các route này phải bị chặn 403.

## Key Insights

- Admin **không** tự sửa role của chính mình xuống USER nếu là admin cuối cùng — tránh khoá
  hệ thống không còn admin nào. Kiểm tra: trước khi hạ role hoặc xoá 1 admin, đếm số admin còn
  lại (`role=ADMIN`), nếu resource đang thao tác là admin cuối cùng → chặn 400 với message rõ
  ràng.
- Admin không xem được task/settings của user khác (đã chốt ở brainstorm) — module này CHỈ
  thao tác trên bảng `User`, không đụng `Task`/`Settings` của người khác.
- "Reset password" nghĩa là admin đặt password mới cho user (admin nhập password mới trực
  tiếp trong request, không phải flow gửi email) — khớp với yêu cầu gốc "admin reset pass".
  Sau khi reset, revoke hết refresh token cũ của user đó (dùng lại `revokeAllUserTokens` từ
  phase 2) để buộc đăng nhập lại.
- Xoá user (`DELETE /api/users/:id`) cascade xoá luôn Task/Settings/RefreshToken của user đó
  (đã khai báo `onDelete: Cascade` trong schema phase 1) — đúng ý "dữ liệu user riêng biệt",
  xoá account thì dữ liệu đi theo, không rác lại DB.

## Requirements

- [x] Middleware `require-admin-middleware.js` — 403 nếu `req.user.role !== 'ADMIN'`
- [x] `GET /api/users` — list toàn bộ user (không trả `passwordHash`)
- [x] `POST /api/users` — tạo user mới `{email, name, password, role}`, role mặc định USER
- [x] `PATCH /api/users/:id` — sửa `name`/`role` (không sửa password ở đây, dùng route riêng)
- [x] `POST /api/users/:id/reset-password` — body `{newPassword}`, admin đặt password mới
- [x] `DELETE /api/users/:id` — xoá user (chặn nếu là admin cuối cùng)

## Architecture

```
src/
├── middleware/
│   └── require-admin-middleware.js
├── routes/
│   └── users-routes.js
├── controllers/
│   └── users-controller.js
└── services/
    └── users-service.js
```

## Related Code Files

**Tạo mới:**
- `backend/src/middleware/require-admin-middleware.js`
- `backend/src/services/users-service.js`
- `backend/src/controllers/users-controller.js`
- `backend/src/routes/users-routes.js`

**Sửa:**
- `backend/src/app.js` — mount `app.use('/api/users', authMiddleware, requireAdminMiddleware, usersRoutes)`

## Implementation Steps

1. `require-admin-middleware.js`: chạy sau `auth-middleware` (đã có `req.user`), nếu
   `req.user.role !== 'ADMIN'` → 403 `{error: 'Forbidden'}`.
2. `users-service.js`:
   - `listUsers()`: `prisma.user.findMany({select: {id,email,name,role,createdAt}})` (loại
     `passwordHash` khỏi select, không dùng object spread rồi xoá field).
   - `createUser({email,name,password,role})`: check email chưa tồn tại (409 nếu trùng), hash
     password, tạo user + tạo kèm `Settings` mặc định (dùng default schema, `create` nested
     hoặc gọi riêng) để user mới login vào là có settings sẵn, không cần fallback null-check ở
     phase 6.
   - `updateUser(id, {name, role})`: nếu đổi role từ ADMIN→USER, gọi `assertNotLastAdmin(id)`
     trước khi update.
   - `resetPassword(id, newPassword)`: hash password mới, update user, gọi
     `revokeAllUserTokens(id)` (import từ `auth-service.js`).
   - `deleteUser(id)`: nếu user đó là ADMIN, gọi `assertNotLastAdmin(id)` trước khi xoá; xoá
     bằng `prisma.user.delete` (cascade tự lo Task/Settings/RefreshToken).
   - `assertNotLastAdmin(userId)`: helper — đếm `prisma.user.count({where:{role:'ADMIN'}})`,
     nếu `<=1` và user đang thao tác chính là admin đó → throw lỗi 400.
3. `users-controller.js`: validate input bằng `zod` (email format, password min length 8,
   role enum), gọi service, trả JSON, map lỗi service (409/400) sang HTTP status tương ứng.
4. `users-routes.js`: khai báo 5 route, không tự gắn middleware auth/admin ở đây — gắn 1 lần ở
   `app.js` khi mount để tránh lặp lại trên từng route.

## Todo

- [x] `require-admin-middleware.js`
- [x] `users-service.js` (list/create/update/resetPassword/delete + assertNotLastAdmin)
- [x] `users-controller.js` + validate zod
- [x] `users-routes.js`, mount vào `app.js` với auth + admin middleware

## Success Criteria

- User role USER gọi bất kỳ route `/api/users/*` → 403
- Admin tạo user mới → user đó login được ngay, có settings mặc định
- Admin reset password user → user login bằng password cũ thất bại, password mới thành công,
  refresh token cũ của user đó bị revoke (refresh call với token cũ → 401)
- Xoá admin cuối cùng → 400, không xoá được
- Xoá user thường → cascade xoá hết task/settings của user đó, không còn record mồ côi trong DB

## Risk Assessment

- **Rủi ro:** quên chặn last-admin ở cả update (hạ role) lẫn delete → hệ thống có thể mất hết
  admin. **Giảm thiểu:** dùng chung 1 helper `assertNotLastAdmin`, gọi ở cả 2 chỗ, viết test
  thủ công riêng cho case này ở phase 7.

## Security Considerations

- Response list/get user không bao giờ trả `passwordHash`.
- Reset password bắt buộc revoke session cũ — nếu không, admin đổi password nhưng attacker
  cầm access token cũ vẫn dùng được tới khi hết hạn 15p (chấp nhận được nhưng refresh token
  phải chết ngay).

## Next Steps

- Phase 4-6 độc lập với phase này, chỉ cần `auth-middleware` từ phase 2, có thể làm song song.
