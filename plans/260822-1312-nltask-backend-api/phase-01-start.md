---
title: "Phase 1: Project Setup & Prisma Schema"
status: todo
---

# Phase 1: Project Setup & Prisma Schema

## Overview

- Priority: P1
- Status: Pending
- Khởi tạo project `backend/` (Express + Prisma + MySQL), định nghĩa toàn bộ schema Prisma
  (User/Task/Settings/RefreshToken), chạy migration đầu tiên. Đây là nền cho mọi phase sau.

## Key Insights

- Repo hiện đang trống (chỉ có `UIDEMO/`), nên đây là greenfield setup, không cần tương thích
  ngược với code cũ.
- Enum trong UI (category/priority/repeat) map trực tiếp sang Prisma enum viết HOA để tránh
  đụng keyword và giữ convention Prisma; giá trị gửi/nhận qua API vẫn dùng lowercase key
  (`work`, `personal`...) để khớp UI — xử lý mapping ở service layer (phase 4/6), schema ở đây
  chỉ định nghĩa enum DB.
- `RefreshToken` model cần thiết dù không có trong yêu cầu gốc, vì "admin reset password" /
  "admin xoá user" phải thực sự invalidate được session cũ — nếu chỉ dùng access token JWT
  thuần không lưu DB thì không revoke được. Đây là hệ quả bắt buộc của chính acceptance
  criteria "admin reset pass", không phải scope creep.

## Requirements

- [x] `backend/package.json` với scripts: `dev`, `start`, `prisma:migrate`, `prisma:generate`, `prisma:studio`
- [x] `backend/prisma/schema.prisma` đầy đủ model + enum
- [x] `.env.example` liệt kê mọi biến môi trường cần thiết
- [x] `.gitignore` loại trừ `node_modules`, `.env`, `dist`

## Architecture

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js                 # Express app: middleware, mount routes
│   ├── server.js              # entrypoint: connect DB, bootstrap admin, listen
│   ├── config/
│   │   └── env-config.js      # đọc & validate biến môi trường (throw nếu thiếu bắt buộc)
│   └── lib/
│       └── prisma-client.js   # singleton PrismaClient
├── .env.example
├── .gitignore
└── package.json
```

## Related Code Files

**Tạo mới:**
- `backend/package.json`
- `backend/prisma/schema.prisma`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/config/env-config.js`
- `backend/src/lib/prisma-client.js`
- `backend/.env.example`
- `backend/.gitignore`

## Implementation Steps

1. `npm init` trong `backend/`, cài dependencies: `express`, `@prisma/client`, `bcrypt`,
   `jsonwebtoken`, `dotenv`, `zod` (validate input); devDependencies: `prisma`, `nodemon`.
2. `npx prisma init --datasource-provider mysql` để tạo `prisma/schema.prisma` +
   `.env` khung sườn.
3. Viết schema đầy đủ:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }

   enum Role { ADMIN USER }
   enum Category { WORK PERSONAL STUDY HEALTH OTHER }
   enum Priority { LOW MEDIUM HIGH }
   enum RepeatType { NONE DAILY WEEKLY }

   model User {
     id            String        @id @default(cuid())
     email         String        @unique
     passwordHash  String
     name          String
     role          Role          @default(USER)
     createdAt     DateTime      @default(now())
     updatedAt     DateTime      @updatedAt
     tasks         Task[]
     settings      Settings?
     refreshTokens RefreshToken[]
     @@map("users")
   }

   model Task {
     id          String     @id @default(cuid())
     userId      String
     user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
     title       String
     desc        String?    @db.Text
     category    Category   @default(OTHER)
     priority    Priority   @default(MEDIUM)
     repeat      RepeatType @default(NONE)
     location    String?
     dueAt       DateTime
     completed   Boolean    @default(false)
     completedAt DateTime?
     createdAt   DateTime   @default(now())
     updatedAt   DateTime   @updatedAt
     @@index([userId])
     @@index([userId, dueAt])
     @@index([userId, completed])
     @@map("tasks")
   }

   model Settings {
     id           String  @id @default(cuid())
     userId       String  @unique
     user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
     push         Boolean @default(true)
     sound        Boolean @default(true)
     vibrate      Boolean @default(true)
     remindBefore Int     @default(15)
     snooze       Int     @default(10)
     quietStart   String  @default("22:00")
     quietEnd     String  @default("07:00")
     @@map("settings")
   }

   model RefreshToken {
     id        String    @id @default(cuid())
     userId    String
     user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
     tokenHash String    @unique
     expiresAt DateTime
     revokedAt DateTime?
     createdAt DateTime  @default(now())
     @@index([userId])
     @@map("refresh_tokens")
   }
   ```
4. `backend/.env.example`:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/nltask"
   JWT_ACCESS_SECRET="change-me"
   JWT_REFRESH_SECRET="change-me-too"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="30d"
   ADMIN_EMAIL="admin@nltask.local"
   ADMIN_PASSWORD="ChangeMe123!"
   ADMIN_NAME="Administrator"
   APP_TIMEZONE="Asia/Ho_Chi_Minh"
   PORT=4000
   ```
5. `src/config/env-config.js`: đọc `process.env` qua `dotenv`, validate các key bắt buộc
   (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`), throw lỗi rõ ràng lúc boot nếu
   thiếu — fail fast thay vì lỗi mơ hồ lúc runtime.
6. `src/lib/prisma-client.js`: export singleton `new PrismaClient()` (tránh tạo nhiều
   connection pool khi nodemon reload).
7. `src/app.js`: tạo Express app, `express.json()`, sẽ mount routes ở các phase sau (để rỗng
   hoặc có 1 route `GET /health` tạm thời).
8. `src/server.js`: import app, gọi bootstrap admin (stub, implement thật ở phase 2), `app.listen(PORT)`.
9. Chạy `npx prisma migrate dev --name init` để tạo migration đầu tiên trên MySQL thật (yêu
   cầu user đã có MySQL server chạy sẵn — ghi rõ trong docs phase 7).

## Todo

- [x] Init package.json + cài dependencies
- [x] Viết schema.prisma đầy đủ 4 model + 4 enum
- [x] Viết `.env.example`, `.gitignore`
- [x] Viết `env-config.js`, `prisma-client.js`, `app.js` (health check), `server.js`
- [x] Chạy `prisma migrate dev --name init` thành công trên MySQL

## Success Criteria

- `npx prisma validate` pass
- `npx prisma migrate dev --name init` tạo migration + áp dụng lên DB MySQL không lỗi
- `node src/server.js` (hoặc `npm run dev`) khởi động, `GET /health` trả 200

## Risk Assessment

- **Rủi ro:** user chưa có MySQL server sẵn → migration fail. **Giảm thiểu:** ghi rõ trong
  `.env.example` comment + docs phase 7 cách nhanh nhất setup MySQL local (Docker 1 dòng lệnh
  hoặc MySQL đã cài sẵn), không tự ý cài Docker/MySQL thay user.

## Security Considerations

- `.env` thật không commit (đã có trong `.gitignore`). `.env.example` chỉ chứa placeholder,
  không chứa secret thật.

## Next Steps

- Phase 2 dùng `prisma-client.js` + schema `User`/`RefreshToken` để implement auth JWT thật.
