---
title: "Phase 4: Hook task_updated & Test Script"
status: done
---

# Phase 4: Hook task_updated & Test Script

## Context Links

- Hàm cần sửa: `backend/src/services/tasks-service.js:88-106` (`updateTask`)
- Zod cho `PATCH /api/tasks/:id`: `backend/src/controllers/tasks-controller.js:23-31`
- Service gửi push: Phase 2 → `notifyTaskUpdated()` trong `backend/src/services/expo-push-service.js`
- Yêu cầu script test: `docs/push-notification-integration.md:109-116`
- Yêu cầu reset khi đổi `dueAt`: `docs/push-notification-integration.md:44-45`

## Overview

- Priority: P1
- Status: Done
- 2 việc độc lập nhau, cùng phase vì cùng nhỏ và cùng phục vụ verify:
  1. `updateTask()` reset cột dedupe khi `dueAt` đổi + bắn `task_updated` fire-and-forget.
  2. Script `backend/scripts/send-test-notification.js` bắn thử 1 push theo `type` truyền qua CLI,
     không đụng DB/cron.

## Key Insights

- `updateTask` hiện dùng `updateMany` rồi `getTaskById` (`tasks-service.js:99-105`) — giữ nguyên
  pattern đó, chỉ chèn thêm 2 thứ: field reset trong `updateData`, và lời gọi push **sau khi** đã
  có task mới (cần `title` mới để đưa vào body).
- **Điều kiện bắn `task_updated`: field CÓ MẶT trong payload**, không so sánh giá trị cũ/mới
  (quyết định đã chốt). Tức `PATCH { "title": "y hệt cũ" }` vẫn bắn. Đơn giản, không cần đọc task
  trước khi update.
- Chỉ 3 field kích hoạt: `title`, `dueAt`, `category`. Sửa `desc`/`priority`/`repeat`/`location`
  **không** bắn.
- **Đã chốt với user (khác 2 loại kia):** `task_updated` **bỏ qua quiet-hours** vì đây là hành
  động do chính user vừa thực hiện trên app, gửi ngay mới có ý nghĩa xác nhận; delay tới sáng hôm
  sau là vô nghĩa. Vẫn tôn trọng `Settings.push=false` và token null. Cài trong `canSendToUser`
  (Phase 2, bước 4) bằng `if (type === 'task_updated') return true;`.
- **Fire-and-forget bắt buộc**: nếu `await`, một lần Expo timeout (mặc định vài giây) sẽ kéo dài
  response `PATCH /api/tasks/:id`; nếu Expo ném lỗi mà không bắt, `error-handler` sẽ trả 500 cho
  một thao tác update **đã thành công** trong DB → sai nghiêm trọng.
- `toggleTask` (`tasks-service.js:108-122`) **không** bắn push — hoàn thành task không nằm trong 3
  field đã chốt. Không mở rộng.

## Requirements

**Functional**
- [x] `data.dueAt !== undefined` → `updateData` thêm `remindedAt: null, lastOverdueNotifiedAt: null`
- [x] Sau update thành công, nếu payload có mặt `title` hoặc `dueAt` hoặc `category` → gửi
      `task_updated` cho chủ task
- [x] Lỗi gửi push không đổi status/response của API
- [x] `node scripts/send-test-notification.js <type>` gửi 1 push thật tới token hardcode trong file
- [x] Script chấp nhận đúng 3 giá trị `task_reminder|task_overdue|task_updated`, sai → in usage +
      `exit 1`

**Non-functional**
- [x] Không đổi contract HTTP của `PATCH /api/tasks/:id` (response vẫn là task đã serialize)
- [x] Script không import cron, không mở kết nối Prisma

## Architecture

```
PATCH /api/tasks/:id
  -> tasks-controller.update            (zod, không đổi)
  -> tasks-service.updateTask(userId, id, data)
       ├── updateData = { ...field hiện có,
       │                  ...(data.dueAt !== undefined && { dueAt, remindedAt: null,
       │                                                    lastOverdueNotifiedAt: null }) }
       ├── prisma.task.updateMany(...)  -> count === 0 => 404 (giữ nguyên)
       ├── task = await getTaskById(userId, id)
       ├── if (shouldNotifyUpdate(data))
       │      notifyTaskUpdated(userId, task).catch(log)   // KHÔNG await
       └── return task                                      // response không chờ push
```

```
backend/scripts/send-test-notification.js
  argv[2] -> type (validate)
  TEST_DEVICE_TOKEN (hardcode trong file)
  -> buildTaskMessage(type, { id: 'test-task-id', title: 'Task test' }, TEST_DEVICE_TOKEN)
  -> sendPushMessages([{ userId: 'test-user', message }])   // không đụng DB
  -> in ticket/receipt ra stdout, exit 0/1
```

Lưu ý: `sendPushMessages` có gọi `clearDeviceTokens` khi gặp `DeviceNotRegistered` — với
`userId: 'test-user'` không tồn tại, `updateMany` khớp 0 dòng → vô hại.

## Related Code Files

**Sửa:**
- `backend/src/services/tasks-service.js` — thêm import `notifyTaskUpdated`, sửa `updateTask` (`:88-106`)

**Tạo mới:**
- `backend/scripts/send-test-notification.js` (thư mục `backend/scripts/` chưa tồn tại)

**Chỉ đọc:** `backend/src/services/expo-push-service.js`, `backend/src/controllers/tasks-controller.js`

**Không đụng:** `backend/src/jobs/**` (Phase 3 sở hữu), `desktop/**`.

## Implementation Steps

1. `backend/src/services/tasks-service.js`, đầu file thêm:
   ```js
   const { notifyTaskUpdated } = require('./expo-push-service');
   ```
   (cùng nhóm import hiện có ở `:1-3`; không tạo vòng lặp import vì `expo-push-service` không
   require `tasks-service`).
2. Thêm helper nhỏ ngay trên `updateTask`:
   ```js
   const NOTIFY_ON_UPDATE_FIELDS = ['title', 'dueAt', 'category'];

   function shouldNotifyUpdate(data) {
     return NOTIFY_ON_UPDATE_FIELDS.some((field) => data[field] !== undefined);
   }
   ```
3. Trong `updateTask`, sửa dòng `dueAt` (`:96`) thành:
   ```js
   ...(data.dueAt !== undefined && {
     dueAt: new Date(data.dueAt),
     remindedAt: null,
     lastOverdueNotifiedAt: null,
   }),
   ```
   Giữ nguyên các dòng field khác.
4. Sửa phần cuối `updateTask` (`:99-105`):
   ```js
   const { count } = await prisma.task.updateMany({ where: { id, userId }, data: updateData });
   if (count === 0) {
     const error = new Error('Task not found');
     error.status = 404;
     throw error;
   }

   const task = await getTaskById(userId, id);
   if (shouldNotifyUpdate(data)) {
     notifyTaskUpdated(userId, task).catch((err) => {
       console.error('[push] task_updated failed for task %s:', id, err);
     });
   }
   return task;
   ```
5. Tạo `backend/scripts/send-test-notification.js`:
   ```js
   // Bắn 1 push thật tới TEST_DEVICE_TOKEN để xác nhận credentials + thiết bị nhận được,
   // trước khi tin cron logic đúng. Không đụng DB, không chạy cron.
   // Chạy trong backend/:  node scripts/send-test-notification.js task_overdue
   const { buildTaskMessage, sendPushMessages } = require('../src/services/expo-push-service');

   const TEST_DEVICE_TOKEN = 'ExponentPushToken[REPLACE_ME]';
   const TYPES = ['task_reminder', 'task_overdue', 'task_updated'];
   ```
   - Đọc `const type = process.argv[2];`, nếu `!TYPES.includes(type)` → in
     `Usage: node scripts/send-test-notification.js <task_reminder|task_overdue|task_updated>` rồi
     `process.exit(1)`.
   - Nếu token còn là `REPLACE_ME` → in hướng dẫn dán token thật, `exit 1`.
   - Build message với task giả `{ id: 'test-task-id', title: 'Task test' }`, gọi
     `sendPushMessages([...])`, `console.log` kết quả, `process.exit(0)`; bọc `.catch` in lỗi +
     `exit 1`.
6. Xác nhận `TEST_DEVICE_TOKEN` là **placeholder** khi commit — không commit token thiết bị thật
   (xem Security).

## Todo List

- [x] Import `notifyTaskUpdated` vào `tasks-service.js`
- [x] `NOTIFY_ON_UPDATE_FIELDS` + `shouldNotifyUpdate(data)`
- [x] Reset `remindedAt`/`lastOverdueNotifiedAt` khi `dueAt` có mặt
- [x] Gọi push fire-and-forget sau `getTaskById`, có `.catch` log
- [x] Tạo `backend/scripts/send-test-notification.js` + validate arg
- [x] Verify 5 case ở Success Criteria

## Success Criteria

- `node scripts/send-test-notification.js task_overdue` (token thật dán tạm) → điện thoại hiện
  "Trễ hạn / Đã trễ hạn: Task test"; chạy với `task_reminder`, `task_updated` → đúng 2 nội dung còn lại
- `node scripts/send-test-notification.js` (thiếu arg) và `... foo` → in usage, exit code 1
- `PATCH /api/tasks/:id {"title":"Tên mới"}` → HTTP 200, response là task đã đổi tên, điện thoại
  nhận "Cập nhật công việc"
- `PATCH /api/tasks/:id {"desc":"abc"}` → HTTP 200, **không** có push
- `PATCH /api/tasks/:id {"dueAt":"<tương lai>"}` → push `task_updated`; kiểm DB:
  `remindedAt IS NULL AND lastOverdueNotifiedAt IS NULL` cho task đó; sau đó `runTick` bắn lại
  `task_reminder` khi tới khung (nối với Phase 3)
- **Không chặn response:** tạm set token thiết bị thành 1 chuỗi Expo hợp lệ nhưng chết
  (`ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`) → `PATCH` vẫn trả 200 nhanh (< ~200ms), log có
  dòng lỗi push; ngắt mạng ra internet → `PATCH` vẫn trả 200
- `PATCH` task không thuộc user → vẫn 404 như cũ, **không** có push nào được gửi
- Toggle complete → không có push

## Risk Assessment

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| `await` nhầm chỗ → response chậm/500 khi Expo lỗi | Trung bình | Cao | Bắt buộc `.catch()` không `await`; case verify "ngắt mạng vẫn 200" |
| Promise reject không bắt → `unhandledRejection` làm chết process | Thấp | Cao | `.catch()` bao trọn; `notifyTaskUpdated` cũng tự try/catch bên trong (Phase 2) |
| Circular require `tasks-service` ↔ `expo-push-service` | Rất thấp | Trung bình | `expo-push-service` chỉ require `prisma`, `env-config`, `date-range-utils`; verify `node -e "require('./src/app')"` |
| Commit nhầm token thiết bị thật trong script | Trung bình | Trung bình | Giữ placeholder `REPLACE_ME`, check `git diff` trước commit |
| Spam push khi client PATCH liên tục (autosave) | Thấp | Trung bình | Mobile hiện chỉ PATCH khi user bấm lưu; nếu sau này có autosave phải thêm debounce phía client — ghi nhận, không xử lý ở BE |
| User sửa `dueAt` về quá khứ → reset dedupe rồi bị bắn `task_overdue` ngay | Trung bình | Thấp | Đúng ý đồ (task "mới" cần nhắc lại), ghi vào docs Phase 5 |

## Security Considerations

- Push chỉ gửi tới `deviceToken` của **chính chủ task**: `notifyTaskUpdated(userId, task)` nhận
  `userId` từ `req.user.id` (`tasks-controller.js:70`), không từ body.
- `updateMany({ where: { id, userId } })` vẫn là hàng rào ownership — không đổi.
- Script test không đọc `.env`, không kết nối DB → chạy được ở máy dev không có DB, và không rò
  dữ liệu user.
- Không log `deviceToken` trong `.catch` (chỉ log `taskId` + lỗi).

## Next Steps

- Phase 5: cập nhật `docs/system-architecture.md`, chạy checklist verify tổng hợp (gồm cả các case
  của phase này), xác nhận `desktop/` sạch.
