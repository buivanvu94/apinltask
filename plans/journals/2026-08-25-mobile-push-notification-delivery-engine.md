---
title: Mobile push notification delivery engine
date: 2026-08-25
summary: Implement cron + hook push notification qua Expo Push API cho backend; fix bug medium về retry semantics do review/test phát hiện
---

# Mobile push notification delivery engine

## What happened

Implement plan `plans/260825-1029-mobile-push-notification/plan.md` (5 phase, đã viết sẵn cực chi tiết):

1. Schema: thêm `Task.remindedAt` + `Task.lastOverdueNotifiedAt` (dedupe), cài `expo-server-sdk@^3.15.0` + `node-cron@^3.0.3` (pin bản CommonJS-compatible, tránh bản ESM-only mới hơn).
2. `backend/src/services/expo-push-service.js`: build message đúng contract mobile, gửi theo chunk, đọc receipt, tự xoá `deviceToken` khi Expo báo `DeviceNotRegistered`, quiet-hours theo `APP_TIMEZONE` (thuật toán y hệt desktop, chỉ khác nguồn giờ).
3. `backend/src/jobs/task-reminder-scheduler.js`: cron mỗi phút quét `task_reminder`/`task_overdue`, cờ `isRunning` chống chạy chồng tick.
4. Hook `task_updated` fire-and-forget trong `tasks-service.updateTask()` khi payload có `title`/`dueAt`/`category`; script test thủ công `backend/scripts/send-test-notification.js`.
5. Cập nhật `docs/system-architecture.md` + `docs/push-notification-integration.md` (bỏ mục "câu hỏi chưa chốt" cũ).

Verify server-side bằng `node -e` trực tiếp trên DB thật (dùng token Expo giả định dạng hợp lệ để test luồng mà không spam thiết bị thật): dedupe không lặp qua nhiều tick/restart, quiet-hours đúng bảng, token chết tự bị dọn, response API không bị block bởi push lỗi, 404 vẫn đúng khi task không thuộc user, toggleTask không bắn push.

Spawn `code-reviewer` + `tester` review độc lập (2 agent riêng, không chia sẻ context) — cả hai cùng phát hiện 1 bug Medium: khi `sendPushNotificationsAsync` throw cho cả 1 chunk (network/Expo 5xx), `runTick` vẫn `updateMany` đánh dấu **toàn bộ** taskIds thu thập được là "đã nhắc", kể cả task nằm trong chunk lỗi chưa từng gửi thành công → mất reminder vĩnh viễn (không bao giờ thử lại vì query sau lọc `remindedAt: null`).

## Decision

Bug này khớp đúng pseudocode gốc trong plan ("gửi trước, đánh dấu sau", "chỉ id đã đưa vào entries") nên không tự ý sửa — hỏi user qua `AskUserQuestion` với 2 lựa chọn (sửa retry đúng / giữ nguyên best-effort ghi docs). User chọn sửa.

Fix: `sendPushMessages` trả thêm `taskId` + `type` trong mỗi receipt entry (lấy từ `message.data`); `runTick` chỉ `updateMany` cho taskId có ticket `'ok'` thật sự, lọc riêng theo `type` (`task_reminder` vs `task_overdue`) để tránh nhầm khi 1 task khớp cả 2 điều kiện cùng lúc (task tạo ra đã quá hạn sẵn — trường hợp có thật, đã gặp lúc test). Verify lại bằng token chết: cả 2 ticket lỗi → cả 2 cột dedupe đúng là `null` (trước fix sẽ bị set sai).

Không sửa 3 finding còn lại của review (race condition thấp, DRY nit, `send-test-notification.js` gián tiếp require `env-config.js`) — đều thuộc nhóm rủi ro thấp/đã chấp nhận theo plan, không đáng đổi thêm code.

## Impact

- Files: `backend/prisma/schema.prisma`, `backend/package.json`, `backend/src/services/expo-push-service.js` (mới), `backend/src/jobs/task-reminder-scheduler.js` (mới), `backend/src/services/tasks-service.js`, `backend/src/utils/date-range-utils.js` (export thêm `getZonedParts`), `backend/src/server.js`, `backend/scripts/send-test-notification.js` (mới), `docs/system-architecture.md`, `docs/push-notification-integration.md`.
- `desktop/` không đụng tới (xác nhận bằng `git status --porcelain desktop/` rỗng).
- Commit `8656cda` (local, chưa push).
- Plan 5/5 phase done (`ak plan status` xác nhận 100%, 70/70 task).

## Next steps

- **Chưa verify end-to-end trên thiết bị thật** (Phase 5 checklist 15 case cần 2 user + device token thật) — không có device token thật trong môi trường agent, chỉ verify được logic server-side. Cần người có thiết bị chạy `docs/push-notification-integration.md` mục 7 + checklist Phase 5 trước khi tin tưởng hoàn toàn trên prod.
- Trước khi bật cron trên staging/prod có dữ liệu task cũ: chạy lại seed SQL chống-burst (đã chạy thử trên dev, 0 row ảnh hưởng vì DB dev chưa có task quá hạn thật).
- Deploy prod: `npx prisma migrate deploy` (không dùng `migrate dev`), đảm bảo chỉ 1 instance chạy scheduler (không PM2 cluster).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
