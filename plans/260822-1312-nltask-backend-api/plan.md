---
title: "NLTASK Backend API"
description: "Node.js + Express + Prisma (MySQL) REST API cho app quản lý công việc NLTASK, có auth JWT và quản lý user theo role admin/user"
status: done
priority: P1
effort: "3-5d"
tags: [backend, api, prisma, mysql, jwt, rbac]
created: 2026-08-22
---

# NLTASK Backend API

## Overview

Backend REST API cho ứng dụng NLTASK (todo/task manager tiếng Việt), tham chiếu UI tại
`UIDEMO/NLTASK Desktop.dc.html`. Cover đủ domain logic suy ra từ UI: task CRUD + toggle
complete, view today/overdue/upcoming, history có search + group theo ngày, stats tuần
(completion rate, streak, weekBars, category breakdown), settings notification/quiet-hours.
Thêm module Users với 2 role ADMIN/USER — admin quản lý account (list/create/reset-password/
delete), user dùng full tính năng task/settings của chính mình, dữ liệu tách biệt hoàn toàn
theo userId. Model layer dùng Prisma (MySQL) để đồng bộ schema qua migration khi đổi cấu trúc
data.

Backend đặt tại `backend/` (root mới, ngang hàng `UIDEMO/`). Không đụng tới UI demo.

## Quyết định kiến trúc đã chốt

- **DB:** MySQL qua Prisma ORM (đã chốt qua brainstorm).
- **Auth:** JWT access token (ngắn hạn, ví dụ 15p) + refresh token (dài hạn, lưu hash trong DB
  bảng `refresh_tokens` để có thể revoke khi admin reset password / xoá user / user logout).
- **Bootstrap admin:** server tự kiểm tra lúc boot — nếu chưa có user nào role ADMIN, tạo 1
  admin từ `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` trong `.env`.
- **Phân tách trách nhiệm:** API trả raw domain data (dueAt ISO string, completed boolean,
  category/priority/repeat enum key...). Không tính toán presentation (màu sắc, label "Quá hạn
  X ngày", `titleColor`...) ở backend — đó là việc của client khi consume API.
- **Timezone:** tính "hôm nay/quá hạn/streak/tuần" theo timezone cấu hình server
  (`APP_TIMEZONE`, mặc định `Asia/Ho_Chi_Minh`), không theo timezone của từng client request.
  Ghi rõ giả định này trong docs vì đây là điểm có thể cần mở rộng sau (theo timezone user) nếu
  app có người dùng ở nhiều múi giờ.
- **Phạm vi loại trừ (non-goals):** không xây delivery engine cho push notification thật (chỉ
  lưu settings), không tự sinh task lặp lại từ field `repeat` (chỉ lưu, không cron sinh
  occurrence mới).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Prisma schema (User/Task/Settings/RefreshToken) + migrate chạy được trên MySQL | P1 |
| 2 | Auth JWT (login/refresh/logout/me) + bootstrap admin từ env lúc boot | P1 |
| 3 | Users module (admin-only CRUD + reset password) với RBAC middleware | P1 |
| 4 | Tasks module (CRUD, toggle, summary) scope theo userId | P1 |
| 5 | History (search + group theo ngày) và Stats tuần (rate/streak/weekBars/category) | P1 |
| 6 | Settings module (get/update per user) | P1 |
| 7 | Docs (README chạy dự án) + kiểm thử thủ công toàn bộ endpoint | P2 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Project Setup & Prisma Schema](./phase-01-start.md) | Done |
| 2 | [Auth Module (JWT)](./phase-02-auth-module-jwt.md) | Done |
| 3 | [Users Module (RBAC)](./phase-03-users-module-rbac.md) | Done |
| 4 | [Tasks Module (CRUD)](./phase-04-tasks-module-crud.md) | Done |
| 5 | [History & Stats](./phase-05-history-and-stats.md) | Done |
| 6 | [Settings Module](./phase-06-settings-module.md) | Done |
| 7 | [Docs & Verification](./phase-07-docs-and-verification.md) | Done |

Thứ tự phase là thứ tự phụ thuộc: 1 → 2 → 3, và 2 → (4,5,6) song song được vì đều chỉ cần
middleware auth từ phase 2. Phase 7 chạy cuối cùng sau khi mọi module xong.

## Success Criteria

- [x] `npx prisma migrate dev` chạy thành công trên MySQL, tạo đủ bảng users/tasks/settings/refresh_tokens
- [x] Server boot tự tạo admin đầu tiên từ env nếu DB chưa có admin nào
- [x] Toàn bộ endpoint task/history/stats/settings chỉ trả về/ghi dữ liệu của `req.user.id`
  (verify bằng cách tạo 2 user, xác nhận không leak chéo)
- [x] Route `/api/users/*` trả 403 với user role USER, hoạt động bình thường với ADMIN
- [x] `npm run dev` chạy server không lỗi, tất cả endpoint trong danh sách phase 2-6 test được qua curl/Postman
- [x] README trong `docs/` mô tả đủ setup (env, migrate, seed/bootstrap, chạy dev)

<!-- slug: nltask-backend-api -->
