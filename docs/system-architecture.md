# System Architecture - NLTASK Backend

## Stack

- Node.js + Express (REST API)
- Prisma ORM + MySQL/MariaDB
- JWT (access token ngắn hạn) + refresh token (random, lưu hash trong DB, revoke được)
- Validation: `zod`

## Thư mục

```
backend/
├── prisma/
│   └── schema.prisma          # User, Task, Settings, RefreshToken + enum
├── src/
│   ├── app.js                 # Express app, mount routes + error handler
│   ├── server.js              # entrypoint: bootstrap admin, listen
│   ├── config/
│   │   └── env-config.js      # đọc & validate biến môi trường
│   ├── lib/
│   │   └── prisma-client.js   # singleton PrismaClient
│   ├── middleware/
│   │   ├── auth-middleware.js           # verify Bearer access token -> req.user
│   │   ├── require-admin-middleware.js  # 403 nếu req.user.role !== ADMIN
│   │   └── error-handler.js             # map lỗi (zod, service.status) -> HTTP response
│   ├── utils/
│   │   ├── jwt-utils.js        # sign/verify access token, tạo/hash refresh token
│   │   ├── password-utils.js   # bcrypt hash/compare
│   │   ├── enum-mapper.js      # map category/priority/repeat lowercase <-> Prisma enum
│   │   └── date-range-utils.js # today/week range, weekday index, dateKey theo APP_TIMEZONE
│   ├── bootstrap/
│   │   └── bootstrap-admin.js  # tạo admin đầu tiên lúc boot nếu DB chưa có admin
│   ├── services/                # business logic, thao tác Prisma
│   ├── controllers/             # validate input (zod) + gọi service + format response
│   └── routes/                  # khai báo route, mount middleware
```

## Data model

- `User`: `id, email(unique), passwordHash, name, role(ADMIN|USER), createdAt, updatedAt`
- `Task`: `id, userId, title, desc, category, priority, repeat, location, dueAt, completed, completedAt, createdAt, updatedAt`
- `Settings`: 1-1 với `User` — `push, sound, vibrate, remindBefore, snooze, quietStart, quietEnd`
- `RefreshToken`: `id, userId, tokenHash(unique), expiresAt, revokedAt, createdAt`

Xoá `User` cascade xoá `Task`/`Settings`/`RefreshToken` liên quan (`onDelete: Cascade`).

## Auth flow

1. `POST /api/auth/login` — verify email/password, trả `accessToken` (JWT, 15p) +
   `refreshToken` (random 48-byte hex, lưu SHA-256 hash trong DB).
2. Mọi route bảo vệ đọc header `Authorization: Bearer <accessToken>` qua `auth-middleware`.
3. `POST /api/auth/refresh` — rotate: revoke refresh token cũ, issue cặp token mới.
4. `POST /api/auth/logout` — revoke refresh token hiện tại.
5. Admin reset password / xoá user → revoke toàn bộ refresh token của user đó
   (`revokeAllUserTokens`), buộc đăng nhập lại.

## Endpoint theo module

| Module | Method + Path | Quyền |
|---|---|---|
| Auth | `POST /api/auth/login` | Public |
| Auth | `POST /api/auth/refresh` | Public (cần refresh token hợp lệ) |
| Auth | `POST /api/auth/logout` | Public (cần refresh token hợp lệ) |
| Auth | `GET /api/auth/me` | Authenticated |
| Auth | `PATCH /api/auth/me` | Authenticated (chỉ tự sửa `deviceToken` của chính mình) |
| Users | `GET /api/users` | Admin |
| Users | `POST /api/users` | Admin |
| Users | `PATCH /api/users/:id` | Admin |
| Users | `POST /api/users/:id/reset-password` | Admin |
| Users | `DELETE /api/users/:id` | Admin |
| Tasks | `GET /api/tasks` | Authenticated |
| Tasks | `GET /api/tasks/summary` | Authenticated |
| Tasks | `GET /api/tasks/:id` | Authenticated |
| Tasks | `POST /api/tasks` | Authenticated |
| Tasks | `PATCH /api/tasks/:id` | Authenticated |
| Tasks | `PATCH /api/tasks/:id/toggle` | Authenticated |
| Tasks | `DELETE /api/tasks/:id` | Authenticated |
| History | `GET /api/history?search=` | Authenticated |
| Stats | `GET /api/stats/week` | Authenticated |
| Settings | `GET /api/settings` | Authenticated |
| Settings | `PATCH /api/settings` | Authenticated |

Mọi route "Authenticated" tự động scope dữ liệu theo `req.user.id` (không nhận `userId` từ
client). Route "Admin" chỉ thao tác bảng `User`, không truy cập `Task`/`Settings` của user khác.

## Nguyên tắc thiết kế

- **Raw data ở backend:** API trả `dueAt`/`completedAt` dạng ISO string, `category`/`priority`/
  `repeat` dạng lowercase key. Không tính label hiển thị ("Quá hạn X ngày", màu sắc...) ở
  backend — đó là việc của client.
- **Timezone cố định server-side:** mọi tính toán "hôm nay/quá hạn/streak/tuần" dùng
  `APP_TIMEZONE` (biến môi trường), không theo timezone của từng client request.
- **Non-goals:** không có delivery engine cho push notification thật (chỉ lưu settings), không
  tự sinh task lặp lại từ field `repeat` (chỉ lưu giá trị, không cron sinh occurrence mới).
