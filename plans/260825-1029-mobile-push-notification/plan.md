---
title: "Mobile Push Notification"
description: "Delivery engine push notification thật cho mobile app Expo/React Native: cron quét task tới hạn/quá hạn + hook task_updated, gửi qua Expo Push API từ backend Node.js"
status: done
priority: P1
effort: "1-2d"
branch: master
tags: [backend, push-notification, expo, cron, prisma, mobile]
created: 2026-08-25
---

# Mobile Push Notification

## Overview

Backend hiện chỉ lưu `User.deviceToken` + `Settings.push` chứ chưa gửi push thật
(`docs/system-architecture.md:94-95` ghi rõ đây là non-goal). Plan này bổ sung delivery engine:

- Cron `node-cron` chạy mỗi phút quét task để bắn `task_reminder` (sắp tới hạn theo
  `Settings.remindBefore`) và `task_overdue` (quá hạn, 1 lần/ngày).
- Hook trong `updateTask()` bắn `task_updated` ngay khi user sửa `title`/`dueAt`/`category`.
- Gửi qua `expo-server-sdk` (Expo lo forward APNs/FCM), tự dọn `deviceToken` chết khi Expo
  trả `DeviceNotRegistered`.

Payload khoá cứng theo contract của team mobile tại `docs/push-notification-integration.md:82-101`
— không đổi tên field. Toàn bộ thay đổi nằm trong `backend/` + `docs/`; **desktop app
(`desktop/`) không được đụng tới**.

## Quyết định kiến trúc đã chốt

- **Schema:** `Task` thêm 2 cột nullable `remindedAt`, `lastOverdueNotifiedAt` (dedupe). Không
  thêm bảng mới, không đổi `User.deviceToken` (1 token/user, không multi-device).
- **Deps:** chỉ `expo-server-sdk` + `node-cron`. Không raw fetch tự viết, không BullMQ/Redis,
  không `setInterval` tự chế, không thêm lib timezone (luxon/date-fns-tz).
- **Version pin:** `expo-server-sdk@^3.15.0` và `node-cron@^3.0.3` — bản major mới hơn
  (`expo-server-sdk@7`, `node-cron@4`) là ESM-only / yêu cầu Node >= 22.12, xung đột với repo
  CommonJS và mốc "Node.js 18+" trong `docs/deployment-guide.md:5`. Chi tiết ở Phase 1.
- **Timezone:** quiet-hours + so sánh "khác ngày" tính theo `APP_TIMEZONE` phía server, tái dùng
  `getZonedParts`/`formatDateKey` trong `backend/src/utils/date-range-utils.js`.
- **Quiet-hours:** áp cho `task_reminder`/`task_overdue`; **không** áp cho `task_updated` (hành
  động do chính user vừa thực hiện).
- **Fire-and-forget:** lỗi gửi push không bao giờ làm fail response API update task.
- **Non-goals:** không làm app mobile (team khác), không multi-device, không map
  `Settings.vibrate` vào payload (Expo push không có field này), không quản lý credentials APNs
  (Expo lo, xong theo `docs/push-notification-integration.md:103-107`).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Migration `Task.remindedAt` + `Task.lastOverdueNotifiedAt` + cài 2 dependency | P1 |
| 2 | `expo-push-service.js`: build message đúng contract, gửi batch, dọn token chết | P1 |
| 3 | Cron mỗi phút bắn `task_reminder` + `task_overdue`, dedupe không gửi trùng | P1 |
| 4 | Hook `task_updated` trong `updateTask()` + script test thủ công | P1 |
| 5 | Cập nhật `docs/system-architecture.md` + verify end-to-end trên thiết bị thật | P2 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Schema & Dependencies](./phase-01-start.md) | Done |
| 2 | [Expo Push Service](./phase-02-expo-push-service.md) | Done |
| 3 | [Cron Scheduler (reminder + overdue)](./phase-03-cron-scheduler-reminder-overdue.md) | Done |
| 4 | [Hook task_updated & Test Script](./phase-04-task-updated-hook-and-test-script.md) | Done |
| 5 | [Docs & Verification](./phase-05-docs-and-verification.md) | Done |

Phụ thuộc tuyến tính: 1 → 2 → (3, 4 song song được vì khác file sở hữu) → 5.
Phase 3 sở hữu `src/jobs/*` + `src/server.js`; Phase 4 sở hữu `src/services/tasks-service.js` +
`scripts/*`. Cả hai chỉ **đọc** `src/services/expo-push-service.js` (Phase 2 sở hữu).

## Dependencies

- npm: `expo-server-sdk@^3.15.0`, `node-cron@^3.0.3` (Phase 1).
- Thiết bị thật (iOS/Android) đã đăng nhập app Expo `@namnhi993/nltask` và đã PATCH
  `deviceToken` lên BE — bắt buộc để verify Phase 5.
- DB MySQL/MariaDB chạy được `prisma migrate deploy`.

## Success Criteria

- [ ] Migration chạy xong, 2 cột mới `NULL`, không mất dữ liệu task cũ
- [ ] Task có `dueAt` trong khung `remindBefore`, user có token hợp lệ + `Settings.push=true`,
      ngoài quiet-hours → nhận **đúng 1** push `task_reminder`, không lặp dù cron chạy nhiều
      tick hoặc restart server
- [ ] Task quá hạn chưa complete → nhận `task_overdue` **1 lần/ngày** (theo `APP_TIMEZONE`) cho
      tới khi complete hoặc sửa `dueAt`
- [ ] Sửa `title`/`dueAt`/`category` → nhận `task_updated` ngay; riêng sửa `dueAt` reset cả 2 cột
      dedupe (task được nhắc lại từ đầu)
- [ ] Token invalid → Expo trả `DeviceNotRegistered` → `User.deviceToken` tự set `null`, cron
      không gửi lại
- [ ] Lỗi gửi push (mạng/Expo 5xx) không làm fail `PATCH /api/tasks/:id`
- [ ] `docs/system-architecture.md` phản ánh đúng kiến trúc mới (bỏ non-goal cũ)
- [ ] `git status` không có bất kỳ thay đổi nào trong `desktop/`

<!-- slug: mobile-push-notification -->
