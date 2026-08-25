---
title: "Phase 1: Schema & Dependencies"
status: done
---

# Phase 1: Schema & Dependencies

## Context Links

- Contract mobile: `docs/push-notification-integration.md:40-45` (yêu cầu cột `remindedAt`)
- Schema hiện tại: `backend/prisma/schema.prisma:51-71` (model `Task`)
- Deps hiện tại: `backend/package.json:13-25`
- Mốc runtime: `docs/deployment-guide.md:5` ("Node.js 18+")

## Overview

- Priority: P1
- Status: Done
- Thêm 2 cột dedupe vào `Task` và cài 2 dependency mới. Đây là nền cho mọi phase sau, không có
  behavior thay đổi nào sau phase này (chưa gửi push).

## Key Insights

- `Task` hiện **chưa có** cột đánh dấu đã nhắc (`backend/prisma/schema.prisma:51-71`) → không có
  cột này cron sẽ gửi trùng mỗi phút, đúng như cảnh báo ở
  `docs/push-notification-integration.md:77-78`.
- `User.deviceToken` **đã có** (`backend/prisma/schema.prisma:41`, migration
  `20260824083625_add_device_token_to_users`) → tái dùng nguyên trạng, không migration cho `User`.
- **Version pin có căn cứ (đã verify qua npm registry ngày 2026-08-25):**
  - `expo-server-sdk@7.2.0` (latest): `"type": "module"`, chỉ export ESM, `engines.node >= 22.12`
    → `require('expo-server-sdk')` sẽ nổ trong repo CommonJS này.
  - `expo-server-sdk@3.15.0`: `main: build/ExpoClient.js`, không có `type: module`, không ràng
    buộc engines → CommonJS OK.
  - `node-cron@4.6.0` (latest): `engines.node >= 20` (có dual export nên `require` chạy được).
  - `node-cron@3.0.3`: `main: src/node-cron.js`, `engines.node >= 6` → an toàn với mốc Node 18+
    trong deployment guide.
  - → Pin `expo-server-sdk@^3.15.0` + `node-cron@^3.0.3`. Nếu team quyết nâng mốc runtime lên
    Node 22.12+ thì mới cân nhắc major mới (cần chuyển sang `await import()` cho expo SDK).
- Không cần biến env mới: `new Expo()` không cần access token (credentials APNs do Expo quản lý,
  `docs/push-notification-integration.md:103-107`). `APP_TIMEZONE` đã có sẵn
  (`backend/src/config/env-config.js:27`).

## Requirements

**Functional**
- [x] `Task.remindedAt DateTime?` — mốc đã bắn `task_reminder`, `null` = chưa bắn
- [x] `Task.lastOverdueNotifiedAt DateTime?` — mốc bắn `task_overdue` gần nhất
- [x] `expo-server-sdk` + `node-cron` có trong `dependencies`

**Non-functional**
- [x] Migration additive, nullable → không mất/đụng dữ liệu task cũ, không cần backfill
- [x] Không thêm index mới ở phase này (xem Risk)

## Architecture

```
Task (thêm 2 cột nullable)
├── remindedAt            NULL -> set = now() sau khi bắn task_reminder
│                         reset về NULL khi user đổi dueAt (Phase 4)
└── lastOverdueNotifiedAt NULL -> set = now() sau mỗi lần bắn task_overdue
                          so sánh formatDateKey(lastOverdueNotifiedAt) != formatDateKey(now)
                          để chỉ bắn 1 lần/ngày theo APP_TIMEZONE
```

Data flow (chưa hoạt động ở phase này, chỉ là hợp đồng dữ liệu cho Phase 3/4):
`cron tick -> đọc 2 cột -> lọc task chưa gửi -> gửi -> ghi lại 2 cột`.

## Related Code Files

**Sửa:**
- `backend/prisma/schema.prisma` — model `Task` (sau dòng `completedAt`, `:63`)
- `backend/package.json` — thêm 2 dependency

**Tạo mới (do Prisma sinh):**
- `backend/prisma/migrations/<timestamp>_add_push_dedupe_to_tasks/migration.sql`

**Không đụng:** `desktop/**`, model `User`/`Settings`/`RefreshToken`.

## Implementation Steps

1. Sửa `backend/prisma/schema.prisma`, model `Task`, thêm ngay dưới `completedAt DateTime?`:
   ```prisma
   remindedAt            DateTime?
   lastOverdueNotifiedAt DateTime?
   ```
   Giữ nguyên căn lề cột kiểu như các field hiện có.
2. Cài deps (chạy trong `backend/`):
   ```bash
   npm install expo-server-sdk@^3.15.0 node-cron@^3.0.3
   ```
   Xác nhận `package.json` ghi đúng range, không có `type: module` bị thêm vào.
3. Tạo migration:
   ```bash
   npx prisma migrate dev --name add_push_dedupe_to_tasks
   ```
   Đọc file `migration.sql` sinh ra, xác nhận chỉ có 2 câu `ALTER TABLE ... ADD COLUMN ... NULL`,
   không có `DROP`/`MODIFY` nào khác.
4. `npx prisma generate` (migrate dev thường tự chạy) rồi smoke test client:
   ```bash
   node -e "const p=require('./src/lib/prisma-client');p.task.findMany({take:1,select:{id:true,remindedAt:true,lastOverdueNotifiedAt:true}}).then(r=>{console.log(r);process.exit(0)})"
   ```
5. Smoke test 2 lib nạp được trong CommonJS:
   ```bash
   node -e "const {Expo}=require('expo-server-sdk');const cron=require('node-cron');console.log(typeof Expo, cron.validate('* * * * *'))"
   ```
   Kỳ vọng in `function true`.

## Todo List

- [x] Thêm `remindedAt` + `lastOverdueNotifiedAt` vào model `Task`
- [x] `npm install expo-server-sdk@^3.15.0 node-cron@^3.0.3`
- [x] `prisma migrate dev --name add_push_dedupe_to_tasks`, review `migration.sql`
- [x] Smoke test Prisma client đọc được 2 cột mới
- [x] Smoke test `require()` 2 lib mới chạy trong CommonJS
- [x] `npm run dev` boot bình thường, `GET /health` trả `{"status":"ok"}`

## Success Criteria

- `npx prisma migrate dev` exit 0; `DESCRIBE tasks;` thấy 2 cột mới kiểu `datetime(3) NULL`
- Số dòng bảng `tasks` trước/sau migration bằng nhau
- `migration.sql` chỉ chứa `ALTER TABLE \`tasks\` ADD COLUMN` cho đúng 2 cột
- `node -e "require('expo-server-sdk')"` không ném `ERR_REQUIRE_ESM`
- `npm run dev` + `GET /api/tasks` vẫn trả đúng như trước (serializer chưa đổi, 2 cột mới không
  lộ ra response — xác nhận `serializeTask` tại `backend/src/services/tasks-service.js:5-20`
  không tự thêm field)

## Risk Assessment

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| `npm install` kéo bản major ESM (nếu quên pin) | Trung bình | Cao (server không boot) | Pin `^3` / `^3.0.3`, smoke test `require()` ở bước 5 |
| Migration chạy trên prod bằng `migrate dev` (reset DB) | Thấp | Rất cao | Prod dùng `npx prisma migrate deploy`, ghi rõ trong Phase 5 |
| Thiếu index cho query cron (full scan bảng `tasks`) | Thấp hiện tại | Trung bình khi data lớn | Đã có `@@index([userId, completed])` và `@@index([userId, dueAt])` (`schema.prisma:67-69`). Query cron lọc theo `completed + dueAt` toàn hệ thống (không theo userId) nên chưa khớp index → **đo trước, thêm sau**: nếu `EXPLAIN` cho thấy full scan gây chậm khi >100k task, mở migration riêng thêm `@@index([completed, dueAt])`. Không thêm speculative ở phase này |
| Prisma client cũ trong node_modules sau khi đổi schema | Thấp | Trung bình | Bước 4 `prisma generate` + smoke test |

## Security Considerations

- Không thêm dữ liệu nhạy cảm: 2 cột chỉ là timestamp.
- Không thêm env var/secret mới → không có nguy cơ rò credential.
- `deviceToken` vẫn nằm trong `USER_LIST_SELECT` (`backend/src/services/users-service.js:5`) —
  giữ nguyên, không mở rộng surface.

## Next Steps

- Phase 2 dùng `expo-server-sdk` vừa cài để viết `expo-push-service.js`.
- Phase 3/4 ghi vào 2 cột vừa tạo.
