---
title: "Phase 2: Expo Push Service"
status: done
---

# Phase 2: Expo Push Service

## Context Links

- Payload contract: `docs/push-notification-integration.md:80-101` (BẤT BIẾN, không đổi tên field)
- Logic quiet-hours tham chiếu: `desktop/src/services/notification-service.ts:36-49` (**chỉ đọc**)
- Timezone helper: `backend/src/utils/date-range-utils.js:3-26` (`getZonedParts`, chưa export)
- Convention service: `backend/src/services/users-service.js` (prisma singleton, `error.status`)
- Settings model: `backend/prisma/schema.prisma:73-86`

## Overview

- Priority: P1
- Status: Done
- Tạo 1 module duy nhất bọc `expo-server-sdk`: build message đúng contract, gửi theo chunk, dọn
  `deviceToken` chết, và quyết định "user này có được nhận loại push này lúc này không".
  Phase 3 (cron) và Phase 4 (hook update) đều chỉ gọi module này — không phase nào tự gọi Expo.

## Key Insights

- **`getZonedParts` chưa export** (`backend/src/utils/date-range-utils.js:79` chỉ export
  `getTodayRange, getWeekRange, getWeekdayIndex, formatDateKey, addZonedDays`) → phải thêm nó vào
  `module.exports`. Không viết lại logic timezone, không thêm lib.
- Quiet-hours phải tính theo **giờ server (`APP_TIMEZONE`)**, khác desktop dùng `now.getHours()`
  (giờ máy client, `notification-service.ts:40`). Thuật toán so sánh phút-trong-ngày + xử lý
  khoảng qua nửa đêm giữ **y hệt** `notification-service.ts:44-48`.
- `sendPushNotificationsAsync` trả ticket **cùng thứ tự** với mảng message truyền vào; ticket
  không chứa lại field `to` → phải tự giữ mảng context song song (`userId`, `taskId`) và cộng dồn
  offset khi duyệt từng chunk.
- Có **2 đường phát hiện token chết**:
  1. Ticket lỗi ngay lập tức: `ticket.status === 'error'` + `ticket.details.error === 'DeviceNotRegistered'`
     (đường tin cậy, có ngay trong response gửi).
  2. Receipt sau đó: `getReceiptsAsync` — nhưng Expo cần thời gian sinh receipt, gọi ngay trong
     cùng tick **thường trả object rỗng**. Đó là hành vi bình thường, không phải lỗi.
  → Implement cả 2, nhưng acceptance "token invalid bị xoá" dựa vào đường (1).
- `Settings` luôn được tạo kèm user (`users-service.js:38`, `bootstrap-admin.js:18`) → coi
  `settings == null` là dữ liệu bất thường: **không gửi** + `console.warn`. Không hard-code lại
  giá trị default của schema (tránh lệch khi schema đổi).
- `Expo.isExpoPushToken(token)` chặn token rác trước khi tốn 1 HTTP request.

## Requirements

**Functional**
- [x] `buildTaskMessage(type, task, deviceToken)` trả **đúng** shape
      `{ to, sound: 'default', title, body, data: { type, taskId } }`
- [x] `type` ∈ `task_reminder | task_overdue | task_updated`; title lần lượt
      `Nhắc việc` / `Trễ hạn` / `Cập nhật công việc` (`docs/push-notification-integration.md:94-98`)
- [x] `canSendToUser(user, type, now)` — kiểm tra token hợp lệ + `settings.push === true` +
      quiet-hours (bỏ qua quiet-hours khi `type === 'task_updated'`)
- [x] `sendPushMessages(entries)` — chunk + gửi + xử lý ticket lỗi + trả về danh sách
      `{ receiptId, userId }`
- [x] `checkReceipts(receiptEntries)` — đọc receipt, xoá token khi `DeviceNotRegistered`
- [x] `notifyTaskUpdated(userId, task)` — composed helper cho Phase 4

**Non-functional**
- [x] Không hàm nào ném lỗi ra ngoài làm chết cron/request: bọc try/catch quanh mỗi lần gọi Expo,
      log rồi trả về kết quả rỗng
- [x] Không log nội dung token đầy đủ (chỉ log `userId`)
- [x] File < 200 dòng (theo rule modularization); nếu vượt, tách phần quiet-hours sang
      `backend/src/utils/quiet-hours-utils.js`

## Architecture

```
backend/src/services/expo-push-service.js
├── const expo = new Expo()                      // singleton module-level
├── PUSH_TITLES = { task_reminder: 'Nhắc việc',
│                   task_overdue: 'Trễ hạn',
│                   task_updated: 'Cập nhật công việc' }
├── isQuietHour(now, quietStart, quietEnd)       // getZonedParts(now, appTimezone)
├── canSendToUser(user, type, now)               // user gồm settings (include)
├── buildTaskMessage(type, task, deviceToken)    // -> Expo message object
├── sendPushMessages(entries)                    // entries: [{ userId, message }]
├── checkReceipts(receiptEntries)                // [{ receiptId, userId }]
├── clearDeviceTokens(userIds)                   // dùng chung 2 đường phát hiện token chết
└── notifyTaskUpdated(userId, task)              // composed: load user -> gửi 1 message
```

Data flow gửi 1 batch:

```
entries [{userId, message}]
  -> expo.chunkPushNotifications(messages)
  -> for each chunk: sendPushNotificationsAsync(chunk)
       tickets[i] khớp entries[offset + i]
       ├─ status 'ok'    -> thu {receiptId: ticket.id, userId}
       └─ status 'error' -> log; nếu details.error === 'DeviceNotRegistered'
                            -> gom userId vào deadUserIds
  -> clearDeviceTokens(deadUserIds)
  -> return receiptEntries
```

Data flow đọc receipt (best-effort):

```
receiptEntries -> chunkPushNotificationReceiptIds -> getReceiptsAsync
  -> receipt.status === 'error' && details.error === 'DeviceNotRegistered'
     -> map receiptId -> userId -> clearDeviceTokens()
  (object rỗng = receipt chưa sẵn sàng, bỏ qua, KHÔNG coi là lỗi)
```

Quiet-hours (tính theo `APP_TIMEZONE`, thuật toán y hệt desktop):

```
{hour, minute} = getZonedParts(now, appTimezone)
cur = hour*60 + minute; start = HH*60+mm(quietStart); end = HH*60+mm(quietEnd)
start <= end  -> cur >= start && cur < end
start >  end  -> cur >= start || cur < end        // khoảng qua nửa đêm 22:00 -> 07:00
```

## Related Code Files

**Tạo mới:**
- `backend/src/services/expo-push-service.js`

**Sửa:**
- `backend/src/utils/date-range-utils.js` — thêm `getZonedParts` vào `module.exports:79`
  (chỉ export thêm, không đổi signature/hành vi hàm nào đang dùng)

**Chỉ đọc, không sửa:**
- `desktop/src/services/notification-service.ts`
- `backend/prisma/schema.prisma`, `backend/src/config/env-config.js`

## Implementation Steps

1. `backend/src/utils/date-range-utils.js`: đổi dòng 79 thành
   `module.exports = { getTodayRange, getWeekRange, getWeekdayIndex, formatDateKey, addZonedDays, getZonedParts };`
   Không sửa gì khác trong file.
2. Tạo `backend/src/services/expo-push-service.js`, phần đầu:
   ```js
   const { Expo } = require('expo-server-sdk');
   const prisma = require('../lib/prisma-client');
   const { appTimezone } = require('../config/env-config');
   const { getZonedParts } = require('../utils/date-range-utils');

   const expo = new Expo();
   const PUSH_TITLES = { task_reminder: 'Nhắc việc', task_overdue: 'Trễ hạn', task_updated: 'Cập nhật công việc' };
   const PUSH_BODIES = {
     task_reminder: (t) => `Sắp đến giờ: ${t.title}`,
     task_overdue: (t) => `Đã trễ hạn: ${t.title}`,
     task_updated: (t) => `Đã cập nhật: ${t.title}`,
   };
   ```
3. `isQuietHour(now, quietStart, quietEnd)`: parse `"HH:mm"` bằng `split(':').map(Number)`, lấy
   `hour/minute` từ `getZonedParts(now, appTimezone)`, so sánh theo công thức ở mục Architecture.
   Nếu `quietStart`/`quietEnd` sai format (NaN) → trả `false` (không chặn gửi) + `console.warn`.
4. `canSendToUser(user, type, now)`:
   ```
   if (!user || !Expo.isExpoPushToken(user.deviceToken)) return false;
   if (!user.settings) { console.warn(...userId); return false; }
   if (!user.settings.push) return false;
   if (type === 'task_updated') return true;              // bỏ qua quiet-hours (xem Key Insights Phase 4)
   return !isQuietHour(now, user.settings.quietStart, user.settings.quietEnd);
   ```
5. `buildTaskMessage(type, task, deviceToken)` trả đúng object contract:
   `{ to: deviceToken, sound: 'default', title: PUSH_TITLES[type], body: PUSH_BODIES[type](task), data: { type, taskId: task.id } }`.
   Không thêm field nào khác (không map `Settings.vibrate` — Expo push message không có field
   tương ứng, ghi comment 1 dòng nêu giới hạn này).
6. `clearDeviceTokens(userIds)`: nếu mảng rỗng return; ngược lại
   `prisma.user.updateMany({ where: { id: { in: [...new Set(userIds)] } }, data: { deviceToken: null } })`
   + `console.warn` số lượng token bị dọn.
7. `sendPushMessages(entries)`:
   - `if (!entries.length) return [];`
   - `const messages = entries.map((e) => e.message);`
   - `const chunks = expo.chunkPushNotifications(messages);`
   - duyệt chunk, giữ `let offset = 0`; mỗi chunk: `try { tickets = await expo.sendPushNotificationsAsync(chunk) } catch (err) { console.error(...); offset += chunk.length; continue; }`
   - duyệt `tickets[i]` ↔ `entries[offset + i]`; gom `receiptEntries` khi `status === 'ok'`; khi
     `status === 'error'` log `ticket.message` và gom `userId` nếu
     `ticket.details?.error === 'DeviceNotRegistered'`.
   - `offset += chunk.length;`
   - cuối: `await clearDeviceTokens(deadUserIds); return receiptEntries;`
8. `checkReceipts(receiptEntries)`: build `Map(receiptId -> userId)`, chunk id qua
   `expo.chunkPushNotificationReceiptIds`, `await expo.getReceiptsAsync(chunk)` trong try/catch,
   duyệt `Object.entries(receipts)`, gom userId khi `receipt.status === 'error' &&
   receipt.details?.error === 'DeviceNotRegistered'`, gọi `clearDeviceTokens`.
9. `notifyTaskUpdated(userId, task)`:
   ```
   const user = await prisma.user.findUnique({ where: { id: userId }, include: { settings: true } });
   if (!canSendToUser(user, 'task_updated', new Date())) return;
   await sendPushMessages([{ userId, message: buildTaskMessage('task_updated', task, user.deviceToken) }]);
   ```
   (không gọi `checkReceipts` ở đường này — ticket lỗi đã xử lý trong `sendPushMessages`).
10. `module.exports = { buildTaskMessage, canSendToUser, sendPushMessages, checkReceipts, notifyTaskUpdated, isQuietHour };`
    (`isQuietHour` export để test tay nhanh bằng `node -e`).

## Todo List

- [x] Export `getZonedParts` từ `date-range-utils.js`
- [x] Tạo `expo-push-service.js` với `PUSH_TITLES`/`PUSH_BODIES`
- [x] `isQuietHour` theo `APP_TIMEZONE`, xử lý khoảng qua nửa đêm
- [x] `canSendToUser` (token hợp lệ + push on + quiet-hours, trừ `task_updated`)
- [x] `buildTaskMessage` đúng contract field
- [x] `sendPushMessages` chunk + align ticket ↔ entry + xử lý ticket lỗi
- [x] `checkReceipts` + `clearDeviceTokens` dùng chung
- [x] `notifyTaskUpdated` composed helper
- [x] Smoke test bằng `node -e` (xem Success Criteria)

## Success Criteria

- `node -e` in ra object message khớp **từng ký tự** field name của
  `docs/push-notification-integration.md:83-89`:
  ```bash
  node -e "const s=require('./src/services/expo-push-service');console.log(JSON.stringify(s.buildTaskMessage('task_reminder',{id:'t1',title:'Hop'},'ExponentPushToken[x]')))"
  ```
  Kỳ vọng: `{"to":"ExponentPushToken[x]","sound":"default","title":"Nhắc việc","body":"Sắp đến giờ: Hop","data":{"type":"task_reminder","taskId":"t1"}}`
- Bảng quiet-hours pass (với `APP_TIMEZONE=Asia/Ho_Chi_Minh`, `22:00`→`07:00`):
  | `now` (giờ VN) | kỳ vọng |
  |---|---|
  | 23:30 | `true` |
  | 06:59 | `true` |
  | 07:00 | `false` |
  | 21:59 | `false` |
  | 22:00 | `true` |
  - Kiểm bằng: `node -e "const s=require('./src/services/expo-push-service');console.log(s.isQuietHour(new Date('2026-08-25T16:30:00Z'),'22:00','07:00'))"` (16:30Z = 23:30 VN → `true`)
- `canSendToUser` trả `false` với: token `null`, token rác `"abc"`, `settings.push=false`,
  `settings=null`; trả `true` cho `task_updated` ngay cả trong quiet-hours
- `sendPushMessages([])` trả `[]` không gọi mạng
- Gửi với token rác không phá vỡ luồng (log lỗi, hàm vẫn resolve)
- `node -e "require('./src/app')"` vẫn nạp app bình thường (không tạo circular dependency)

## Risk Assessment

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Đổi/thêm field trong payload → app mobile không hiển thị đúng | Thấp | Cao | Success Criteria so khớp JSON nguyên văn với contract |
| Ticket lệch index sau khi chunk → xoá nhầm token của user khác | Trung bình | Cao | Cộng dồn `offset` theo `chunk.length` kể cả nhánh lỗi; test với >100 message giả để ép chunk (Expo chunk ~100/lần) |
| `getReceiptsAsync` trả rỗng ngay trong tick → hiểu nhầm là lỗi | Cao | Thấp | Coi rỗng là hợp lệ; token chết vẫn bị dọn qua ticket lỗi |
| Lỗi mạng/Expo 5xx làm cron chết | Trung bình | Cao | try/catch từng chunk, không throw ra ngoài |
| Export thêm `getZonedParts` phá code cũ | Rất thấp | Trung bình | Chỉ thêm tên vào `module.exports`, không sửa thân hàm; verify `GET /api/stats/week` + `GET /api/history` vẫn chạy |
| File vượt 200 dòng | Trung bình | Thấp | Tách `quiet-hours-utils.js` nếu vượt |

## Security Considerations

- Chỉ log `userId` + mã lỗi Expo, **không log** `deviceToken` đầy đủ (token cho phép gửi push tới
  thiết bị user).
- `clearDeviceTokens` chỉ ghi `deviceToken = null`, không đụng field khác của `User`.
- Không thêm endpoint/route mới → không mở rộng attack surface HTTP.
- `Expo.isExpoPushToken` chặn giá trị rác do client gửi lên qua `PATCH /api/auth/me`
  (`backend/src/controllers/auth-controller.js:15-17` chỉ validate `string | null`).

## Next Steps

- Phase 3: cron gọi `canSendToUser` + `buildTaskMessage` + `sendPushMessages` + `checkReceipts`.
- Phase 4: `tasks-service.updateTask()` gọi `notifyTaskUpdated`.
