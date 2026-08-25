---
title: "Phase 5: Docs & Verification"
status: done
---

# Phase 5: Docs & Verification

## Context Links

- Doc cần sửa: `docs/system-architecture.md` — cây thư mục `:12-37`, data model `:39-46`,
  nguyên tắc + non-goals `:87-95`
- Contract mobile (nguồn sự thật payload): `docs/push-notification-integration.md`
- Deploy: `docs/deployment-guide.md`
- Acceptance tổng: `plan.md` mục Success Criteria

## Overview

- Priority: P2
- Status: Done
- Chốt lại tài liệu kiến trúc (vì đây là thay đổi kiến trúc thật: thêm background job + module
  delivery + 2 cột schema) và chạy verify end-to-end trên thiết bị thật với 2 user.

## Key Insights

- `docs/system-architecture.md:94-95` đang ghi non-goal **"không có delivery engine cho push
  notification thật (chỉ lưu settings)"** — sau plan này là **sai sự thật**, bắt buộc sửa (rule
  documentation-management: thay đổi kiến trúc → cập nhật surface sở hữu nó).
- Non-goal còn lại ở cùng câu ("không tự sinh task lặp lại từ `repeat`") **vẫn đúng** → giữ.
- Cây thư mục `:12-37` chưa có `jobs/`, `scripts/`, và mục `services/` đang mô tả chung chung →
  thêm dòng cho `jobs/task-reminder-scheduler.js`, `services/expo-push-service.js`,
  `scripts/send-test-notification.js`.
- Data model `:42` liệt kê field của `Task` → thêm `remindedAt`, `lastOverdueNotifiedAt`.
- 2 ràng buộc vận hành mới **phải** ghi vào docs vì người deploy không thể đoán ra:
  scheduler chỉ được chạy ở **1 instance**, và `Settings.vibrate` **không** map vào payload Expo.
- `docs/deployment-guide.md:5` ghi "Node.js 18+" — 2 dependency đã pin để tương thích mốc này
  (Phase 1) nên **không cần sửa** deployment guide.

## Requirements

**Functional**
- [x] `docs/system-architecture.md` mô tả đúng: cron `node-cron`, `expo-push-service`, 2 cột mới,
      3 loại `data.type`, quy tắc quiet-hours (và ngoại lệ `task_updated`)
- [x] Bỏ mệnh đề non-goal đã lỗi thời, giữ mệnh đề non-goal `repeat`
- [x] Ghi rõ giới hạn: 1 token/user (không multi-device), `vibrate` không map, chỉ 1 instance chạy scheduler

**Non-functional**
- [x] Không copy lại payload chi tiết từ `push-notification-integration.md` — link tới nó
      (tránh 2 nguồn sự thật lệch nhau)
- [x] Không có thay đổi nào trong `desktop/`

## Architecture

Nội dung cần có trong `docs/system-architecture.md` (mục mới, đặt sau "Endpoint theo module"):

```markdown
## Push notification (mobile)

- Token: `User.deviceToken` = Expo push token, mobile tự PATCH qua `PATCH /api/auth/me`.
  1 token / user (không multi-device).
- Delivery: `src/services/expo-push-service.js` bọc `expo-server-sdk` — build message, chunk,
  đọc receipt, tự xoá `deviceToken` khi Expo báo `DeviceNotRegistered`.
- Scheduler: `src/jobs/task-reminder-scheduler.js`, `node-cron` `* * * * *`:
  - `task_reminder` — `dueAt` nằm trong khung `Settings.remindBefore`, dedupe bằng `Task.remindedAt`
  - `task_overdue`  — quá `dueAt` chưa hoàn thành, tối đa 1 lần/ngày theo `APP_TIMEZONE`,
    dedupe bằng `Task.lastOverdueNotifiedAt`
- `task_updated` bắn ngay trong `tasks-service.updateTask()` khi payload có `title`/`dueAt`/
  `category`; sửa `dueAt` reset cả 2 cột dedupe. Gửi kiểu fire-and-forget, lỗi push không ảnh
  hưởng response API.
- Điều kiện gửi: `Settings.push = true` + token hợp lệ + ngoài quiet-hours
  (`quietStart`/`quietEnd` tính theo `APP_TIMEZONE`). Riêng `task_updated` bỏ qua quiet-hours vì
  do chính user vừa thao tác.
- Payload theo contract của mobile: xem `docs/push-notification-integration.md`.
- Giới hạn đã biết: `Settings.vibrate` không có field tương ứng trong Expo push message nên không
  được map; scheduler chạy trong process API nên chỉ được deploy **1 instance** (nhiều instance
  sẽ gửi trùng).
```

## Related Code Files

**Sửa:**
- `docs/system-architecture.md` (cây thư mục, data model `Task`, non-goals, thêm mục "Push notification (mobile)")
- `docs/push-notification-integration.md` (mục "Câu hỏi chưa chốt" cuối file — đã có đáp án, xem
  Implementation Steps bước 7)

**Chỉ đọc:** toàn bộ code Phase 1-4.

**Không đụng:** `desktop/**`.

## Implementation Steps

1. Đọc lại `docs/system-architecture.md` trước khi sửa (rule documentation-management).
2. Cây thư mục `:12-37`: thêm
   ```
   │   ├── jobs/
   │   │   └── task-reminder-scheduler.js   # cron * * * * *: task_reminder + task_overdue
   ```
   và ghi chú `expo-push-service.js` trong mục `services/`; thêm ở cấp `backend/`:
   ```
   ├── scripts/
   │   └── send-test-notification.js        # bắn thử 1 push, không đụng DB/cron
   ```
3. Data model `:42`: bổ sung `remindedAt, lastOverdueNotifiedAt` vào danh sách field của `Task`.
4. Chèn mục "Push notification (mobile)" như mẫu ở Architecture.
5. Non-goals `:94-95`: sửa còn `**Non-goals:** không tự sinh task lặp lại từ field 'repeat' (chỉ
   lưu giá trị, không cron sinh occurrence mới).` — bỏ hẳn mệnh đề về push.
6. Verify link/claim: đối chiếu từng tên file/hàm vừa ghi với code thực tế (`ls backend/src/jobs`,
   `grep -n "notifyTaskUpdated" backend/src/services/tasks-service.js`).
7. Cập nhật `docs/push-notification-integration.md` mục "Câu hỏi chưa chốt" (cuối file): xoá mục
   này, thay bằng đáp án ngắn — BE dùng Node.js + Express + Prisma (MySQL), cột đánh dấu là
   `Task.remindedAt` (đã thêm ở Phase 1), `task_overdue`/`task_updated` đã có nơi trigger (cron
   `task-reminder-scheduler.js` cho overdue, hook trong `tasks-service.updateTask()` cho updated).
8. **Trước khi bật cron trên môi trường có dữ liệu task cũ (staging/prod)** — chạy 1 lần, sau khi
   migration Phase 1 đã áp dụng nhưng **trước** khi start server bản có scheduler:
   ```sql
   UPDATE tasks SET lastOverdueNotifiedAt = NOW() WHERE completed = 0 AND dueAt < NOW();
   ```
   Tránh burst `task_overdue` cho toàn bộ task quá hạn sẵn có ở tick đầu tiên. Backup DB trước khi
   chạy (theo rule "luôn backup trước thay đổi schema/data").

## Todo List

- [x] Cập nhật cây thư mục + data model trong `system-architecture.md`
- [x] Thêm mục "Push notification (mobile)"
- [x] Sửa dòng non-goals
- [x] Cập nhật `docs/push-notification-integration.md` — xoá mục "Câu hỏi chưa chốt", ghi đáp án
- [x] Backup DB rồi chạy seed SQL `lastOverdueNotifiedAt` trước khi bật cron trên staging/prod
- [x] Chạy checklist verify end-to-end bên dưới
- [x] Xác nhận `git status`/`git diff --stat` không chạm `desktop/`

## Success Criteria

**Docs**
- Không còn chuỗi "không có delivery engine" trong `docs/system-architecture.md`
  (`grep -n "delivery engine" docs/system-architecture.md` → rỗng)
- Mọi đường dẫn file nêu trong doc đều tồn tại thật
- `docs/push-notification-integration.md` không còn mục "Câu hỏi chưa chốt"
  (`grep -n "chưa chốt" docs/push-notification-integration.md` → rỗng)

**Seed chống burst (bắt buộc trước khi bật cron trên staging/prod có task cũ)**
- Backup DB xong, chạy seed SQL ở Implementation Steps bước 8 → `SELECT COUNT(*) FROM tasks WHERE
  completed=0 AND dueAt<NOW() AND lastOverdueNotifiedAt IS NULL;` trả `0`
- Sau khi bật cron, tick đầu tiên **không** gửi `task_overdue` cho task cũ (chỉ log `overdue=0` nếu
  không có task overdue mới phát sinh sau thời điểm seed)

**Verify end-to-end (thiết bị thật, 2 user A và B, mỗi user 1 token khác nhau)**

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| 1 | Script test 3 type | 3 thông báo đúng title/body trên máy |
| 2 | A tạo task `dueAt = now+10p`, `remindBefore=15` | A nhận 1 `task_reminder`; B không nhận gì |
| 3 | Để cron chạy thêm 5 phút | Không có push lặp lại; `remindedAt` giữ nguyên |
| 4 | Restart server, chờ 2 tick | Vẫn không lặp |
| 5 | Task của A quá hạn 1 giờ | A nhận 1 `task_overdue`; tick sau trong ngày không lặp |
| 6 | Sửa tay `lastOverdueNotifiedAt` về hôm qua | Tick kế tiếp bắn lại đúng 1 lần |
| 7 | A hoàn thành task overdue | Không còn push |
| 8 | A `PATCH` `title` | Nhận `task_updated` ngay (< 5s) |
| 9 | A `PATCH` `desc` | Không có push |
| 10 | A `PATCH` `dueAt` sang tương lai | Nhận `task_updated`; 2 cột dedupe = NULL; tới khung lại nhận `task_reminder` |
| 11 | A đặt `Settings.push = false` | Không loại nào được gửi cho A |
| 12 | Đặt quiet-hours phủ giờ hiện tại | `task_reminder`/`task_overdue` bị chặn (`remindedAt` vẫn NULL), `task_updated` vẫn gửi |
| 13 | Gỡ app / dùng token chết | Sau lần gửi kế tiếp, `User.deviceToken` = NULL trong DB; tick sau không gửi cho user đó |
| 14 | Ngắt internet server rồi `PATCH` task | API vẫn 200, log ghi lỗi push, server không crash |
| 15 | Chạy server ≥ 30 phút | Log sạch, không stack trace, không rò kết nối DB |

**Repo sạch**
- `git status --porcelain desktop/` → rỗng
- `git diff --stat` chỉ liệt kê `backend/**` + `docs/system-architecture.md` + `plans/**`

## Risk Assessment

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Deploy prod bằng `prisma migrate dev` (reset DB) | Thấp | Rất cao | Dùng `npx prisma migrate deploy` trên prod; kiểm tra `docs/deployment-guide.md` có nêu đúng lệnh trước khi deploy |
| Bật cron trên prod gây burst `task_overdue` cho task cũ | Cao | Cao | **Đã chốt: bắt buộc chạy seed.** Backup DB rồi chạy `UPDATE tasks SET lastOverdueNotifiedAt = NOW() WHERE completed = 0 AND dueAt < NOW();` trước khi start server bản có scheduler (bước 8) |
| Docs mô tả lệch code sau khi refactor sau này | Trung bình | Thấp | Doc link tới file cụ thể, không copy code |
| Verify thiếu case 2-user → lỗi gửi nhầm token bị bỏ lọt | Thấp | Rất cao | Case #2 bắt buộc có user B |
| Deploy 2 instance vô tình (PM2 cluster) | Trung bình | Cao | Đã ghi ràng buộc vào docs; kiểm `pm2 list`/compose replicas trước khi bật |

## Security Considerations

- Trước khi commit: `git diff` xác nhận `scripts/send-test-notification.js` không chứa token
  thiết bị thật, không có `.env` nào bị stage.
- Docs không chứa token/credential mẫu thật.
- Rà lại log của lần verify: không có dòng nào in trọn `ExponentPushToken[...]`.

## Next Steps

- Sau khi checklist pass: cập nhật status các phase bằng `ak plan check <phase-file>`.
- Báo lại team mobile rằng 3 loại `data.type` đã hoạt động thật (họ có thể bắt đầu làm deep-link
  bằng `data.taskId`).
