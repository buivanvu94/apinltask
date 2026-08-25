---
title: "Phase 3: Cron Scheduler (reminder + overdue)"
status: done
---

# Phase 3: Cron Scheduler (reminder + overdue)

## Context Links

- Pseudocode gốc: `docs/push-notification-integration.md:47-78`
- Service gửi push: Phase 2 → `backend/src/services/expo-push-service.js`
- Helper ngày/giờ: `backend/src/utils/date-range-utils.js:53-57` (`getTodayRange`), `:73-77` (`formatDateKey`)
- Entrypoint: `backend/src/server.js:5-10`
- Ràng buộc `remindBefore` ∈ {0,5,15,30}: `backend/src/controllers/settings-controller.js:9`

## Overview

- Priority: P1
- Status: Done
- Job `node-cron` chạy mỗi phút (`* * * * *`): quét task cần nhắc trước hạn (`task_reminder`) và
  task quá hạn chưa xong (`task_overdue`), gửi qua `expo-push-service`, ghi cột dedupe, cuối tick
  đọc receipt 1 lần.

## Key Insights

- **`remindBefore` là per-user** nên không thể nhét thẳng vào 1 câu `where`. Cách chọn: query
  **1 lần** với biên trên = `MAX(Settings.remindBefore)` rồi lọc chính xác trong JS theo từng
  task. Tránh N+1 query theo user như pseudocode gốc
  (`docs/push-notification-integration.md:53-58`), vẫn ra cùng kết quả.
  - Biên trên lấy động: `prisma.settings.aggregate({ _max: { remindBefore: true } })`, fallback 30
    nếu `null`. Không hard-code 30 vì cột DB là `Int` không ràng buộc — chỉ zod ở tầng API mới
    giới hạn {0,5,15,30} (`settings-controller.js:9`), sửa tay trong DB có thể vượt.
- **Dedupe `task_overdue` "1 lần/ngày"**: prefilter ở DB bằng
  `OR: [{ lastOverdueNotifiedAt: null }, { lastOverdueNotifiedAt: { lt: getTodayRange(now).start } }]`
  rồi **xác nhận lại trong JS** bằng `formatDateKey(lastOverdueNotifiedAt) !== formatDateKey(now)`
  (đúng theo `APP_TIMEZONE`, xử lý được cả DST). Không viết SQL date function.
- **Chống chạy chồng tick**: `node-cron@3` không có `noOverlap`. Nếu 1 tick chạy >60s (Expo chậm),
  tick sau vào song song → gửi trùng. Bắt buộc có cờ `isRunning` cấp module.
- **Task bị chặn bởi quiet-hours không set `remindedAt`** → sẽ được gửi ở tick đầu tiên sau khi
  hết quiet-hours (giao muộn, không mất). Đây là hệ quả trực tiếp của quyết định "chỉ set
  `remindedAt` cho task đã gửi" — cố ý, ghi rõ để không bị hiểu là bug.
- **Lần chạy đầu sau khi deploy**: mọi task quá hạn đang tồn tại đều có
  `lastOverdueNotifiedAt = NULL` → burst `task_overdue` cho toàn bộ task cũ. Xem Risk để chọn
  cách xử lý trước khi bật cron trên prod.
- Scheduler chạy **trong process API** → giả định **1 instance duy nhất**. Chạy 2 instance
  (PM2 cluster / 2 container) sẽ gửi trùng vì cơ chế là gửi-rồi-đánh-dấu.

## Requirements

**Functional**
- [x] Cron `* * * * *` khởi động sau `bootstrapAdmin()` trong `server.js`
- [x] `task_reminder`: `completed=false` + `remindedAt=null` + `dueAt <= now + remindBefore(user)`
- [x] `task_overdue`: `completed=false` + `dueAt < now` + chưa bắn trong ngày hôm nay (APP_TIMEZONE)
- [x] Chỉ gửi cho user qua được `canSendToUser(...)` (token hợp lệ, `push=true`, ngoài quiet-hours)
- [x] Sau khi gửi: set `remindedAt = now` / `lastOverdueNotifiedAt = now` cho **đúng** các task đã gửi
- [x] Cuối tick: gọi `checkReceipts()` 1 lần cho toàn bộ ticket sinh ra trong tick

**Non-functional**
- [x] Không tick nào được chạy chồng lên tick trước
- [x] Mọi lỗi trong tick bị nuốt + log, không làm crash process
- [x] Không gửi query nào theo vòng lặp user (giữ 3 query/tick: max-remindBefore, reminder, overdue)

## Architecture

```
backend/src/jobs/task-reminder-scheduler.js
├── let isRunning = false
├── runTick(now = new Date())            // export để test tay, không cần chờ cron
│   ├── collectReminderEntries(now)  -> { entries, taskIds }
│   ├── collectOverdueEntries(now)   -> { entries, taskIds }
│   ├── receipts = await sendPushMessages([...reminderEntries, ...overdueEntries])
│   ├── prisma.task.updateMany({ id: { in: sentReminderIds } },  { remindedAt: now })
│   ├── prisma.task.updateMany({ id: { in: sentOverdueIds } },   { lastOverdueNotifiedAt: now })
│   └── await checkReceipts(receipts)
└── startTaskReminderScheduler()         // cron.schedule('* * * * *', guardedRunTick)
```

Data flow 1 tick:

```
now
 ├─ maxRemind = settings.aggregate(_max.remindBefore) ?? 30
 ├─ REMINDER: task.findMany({
 │      completed: false, remindedAt: null,
 │      dueAt: { lte: now + maxRemind*60_000 },
 │      user: { deviceToken: { not: null } }
 │    }, include: { user: { include: { settings: true } } })
 │    -> JS filter: canSendToUser(task.user,'task_reminder',now)
 │                  && task.dueAt <= now + settings.remindBefore*60_000
 │    -> entries[{ userId, message: buildTaskMessage('task_reminder', task, token) }]
 ├─ OVERDUE: task.findMany({
 │      completed: false, dueAt: { lt: now },
 │      OR: [{ lastOverdueNotifiedAt: null },
 │           { lastOverdueNotifiedAt: { lt: getTodayRange(now).start } }],
 │      user: { deviceToken: { not: null } }
 │    }, include: { user: { include: { settings: true } } })
 │    -> JS filter: canSendToUser(task.user,'task_overdue',now)
 │                  && (task.lastOverdueNotifiedAt == null
 │                      || formatDateKey(task.lastOverdueNotifiedAt) !== formatDateKey(now))
 ├─ sendPushMessages(all entries)  -> receiptEntries (ticket lỗi đã tự dọn token)
 ├─ updateMany remindedAt / lastOverdueNotifiedAt (chỉ id đã đưa vào entries)
 └─ checkReceipts(receiptEntries)
```

Ghi chú thứ tự: **gửi trước, đánh dấu sau** (theo quyết định đã chốt +
`docs/push-notification-integration.md:66-67`). Cửa sổ crash giữa 2 bước rất hẹp; hệ quả xấu nhất
là 1 thông báo lặp sau khi restart đúng vào khoảnh khắc đó.

## Related Code Files

**Tạo mới:**
- `backend/src/jobs/task-reminder-scheduler.js`

**Sửa:**
- `backend/src/server.js` — import + gọi `startTaskReminderScheduler()` sau `await bootstrapAdmin()`,
  trước `app.listen`

**Chỉ đọc:**
- `backend/src/services/expo-push-service.js` (Phase 2 sở hữu)
- `backend/src/utils/date-range-utils.js`

**Không đụng:** `backend/src/services/tasks-service.js` (Phase 4 sở hữu), `desktop/**`.

## Implementation Steps

1. Tạo `backend/src/jobs/task-reminder-scheduler.js`:
   ```js
   const cron = require('node-cron');
   const prisma = require('../lib/prisma-client');
   const { canSendToUser, buildTaskMessage, sendPushMessages, checkReceipts } = require('../services/expo-push-service');
   const { getTodayRange, formatDateKey } = require('../utils/date-range-utils');

   const DEFAULT_MAX_REMIND_BEFORE_MIN = 30;
   let isRunning = false;
   ```
2. `async function getMaxRemindBeforeMs()`:
   `prisma.settings.aggregate({ _max: { remindBefore: true } })` →
   `(agg._max.remindBefore ?? DEFAULT_MAX_REMIND_BEFORE_MIN) * 60_000`.
3. `async function collectReminderEntries(now)`:
   - `const horizon = new Date(now.getTime() + await getMaxRemindBeforeMs());`
   - `findMany` theo where ở mục Architecture, `include: { user: { include: { settings: true } } }`.
   - Duyệt, bỏ qua task không qua `canSendToUser(task.user, 'task_reminder', now)`.
   - Kiểm chính xác: `task.dueAt.getTime() <= now.getTime() + task.user.settings.remindBefore * 60_000`.
   - Trả `{ entries, taskIds }` (`taskIds` chỉ chứa task thực sự tạo message).
4. `async function collectOverdueEntries(now)`: tương tự, where dùng
   `dueAt: { lt: now }` + `OR` như trên với `getTodayRange(now).start`; kiểm lại bằng
   `formatDateKey`.
5. `async function runTick(now = new Date())`:
   - gọi 2 hàm collect (tuần tự cho dễ đọc; không cần `Promise.all`, tick 1 phút thừa thời gian).
   - `const receipts = await sendPushMessages([...reminder.entries, ...overdue.entries]);`
   - `if (reminder.taskIds.length) await prisma.task.updateMany({ where: { id: { in: reminder.taskIds } }, data: { remindedAt: now } });`
   - tương tự cho `overdue.taskIds` với `lastOverdueNotifiedAt: now`.
   - `await checkReceipts(receipts);`
   - log 1 dòng gọn khi có gửi: `console.log('[push] tick: reminder=%d overdue=%d', ...)` — im lặng
     khi cả hai = 0 để không rác log mỗi phút.
6. `function startTaskReminderScheduler()`:
   ```js
   cron.schedule('* * * * *', async () => {
     if (isRunning) { console.warn('[push] previous tick still running, skip'); return; }
     isRunning = true;
     try { await runTick(); }
     catch (err) { console.error('[push] tick failed:', err); }
     finally { isRunning = false; }
   });
   console.log('[push] task reminder scheduler started (* * * * *)');
   ```
   Không truyền `timezone` cho `cron.schedule` — job chạy mỗi phút nên timezone không ảnh hưởng;
   mọi logic ngày/giờ đã tính bằng `APP_TIMEZONE` bên trong.
7. `module.exports = { startTaskReminderScheduler, runTick };`
8. Sửa `backend/src/server.js`:
   ```js
   const { startTaskReminderScheduler } = require('./jobs/task-reminder-scheduler');
   ...
   await bootstrapAdmin();
   startTaskReminderScheduler();
   app.listen(port, ...)
   ```

## Todo List

- [x] Tạo `src/jobs/task-reminder-scheduler.js` khung + cờ `isRunning`
- [x] `getMaxRemindBeforeMs()` (aggregate `_max`, fallback 30)
- [x] `collectReminderEntries(now)` + lọc chính xác theo `remindBefore` từng user
- [x] `collectOverdueEntries(now)` + xác nhận khác ngày bằng `formatDateKey`
- [x] `runTick(now)` gửi → updateMany 2 cột → `checkReceipts`
- [x] `startTaskReminderScheduler()` + wire vào `server.js`
- [x] Chạy tay `runTick()` với dữ liệu dựng sẵn để verify (xem Success Criteria)

## Success Criteria

Dựng dữ liệu test bằng 1 user thật có `deviceToken` hợp lệ + `Settings.push=true`,
`remindBefore=15`, quiet-hours `22:00`→`07:00`, chạy ngoài khung quiet-hours.

- **Reminder gửi đúng 1 lần:** tạo task `dueAt = now + 10 phút`. Chạy
  `node -e "require('./src/jobs/task-reminder-scheduler').runTick().then(()=>process.exit(0))"`
  → điện thoại nhận 1 push "Nhắc việc"; `remindedAt` trong DB != null. Chạy lại lần 2 → **không**
  có push mới, log `reminder=0`.
- **Ngoài khung không gửi:** task `dueAt = now + 60 phút` với `remindBefore=15` → `runTick` không
  gửi gì.
- **Quiet-hours chặn nhưng không mất:** set `quietStart/quietEnd` bao trùm giờ hiện tại → `runTick`
  không gửi và `remindedAt` vẫn `null`; bỏ quiet-hours rồi `runTick` lại → gửi.
- **Overdue 1 lần/ngày:** task `dueAt = now - 1 giờ`, `completed=false` → `runTick` gửi "Trễ hạn",
  set `lastOverdueNotifiedAt`. `runTick` lần 2 trong cùng ngày → không gửi. Sửa tay
  `lastOverdueNotifiedAt` về hôm qua → `runTick` gửi lại.
- **Complete thì im:** toggle task overdue thành `completed=true` → `runTick` không gửi nữa.
- **Push tắt / token null:** `Settings.push=false` hoặc `deviceToken=null` → không gửi, không lỗi.
- **Cron sống:** `npm run dev`, để chạy ≥ 5 phút, log có dòng start, không có stack trace, CPU/DB
  không tăng bất thường (tick rỗng chỉ 3 query nhẹ).
- **Không chạy chồng:** tạm thêm `await new Promise(r=>setTimeout(r,70000))` vào đầu `runTick`,
  chạy `npm run dev` → thấy log `previous tick still running, skip`; xoá đoạn tạm sau khi verify.

## Risk Assessment

| Rủi ro | Khả năng | Tác động | Giảm thiểu |
|---|---|---|---|
| Burst `task_overdue` cho toàn bộ task quá hạn cũ ở lần deploy đầu | **Cao** | Cao (spam user) | **Đã chốt: bắt buộc.** Trước khi bật cron trên staging/prod, backup DB rồi chạy seed: `UPDATE tasks SET lastOverdueNotifiedAt = NOW() WHERE completed = 0 AND dueAt < NOW();` (checklist + Success Criteria ở Phase 5) |
| Chạy 2 instance (PM2 cluster) → gửi trùng | Trung bình | Cao | Ghi rõ ràng buộc "scheduler chỉ chạy 1 instance" vào `docs/system-architecture.md` (Phase 5). Nếu sau này phải scale: đổi sang claim-trước-gửi (`updateMany` với điều kiện `remindedAt: null` rồi mới gửi) |
| Tick chồng nhau khi Expo chậm | Trung bình | Cao | Cờ `isRunning` + verify bằng test tạm ở Success Criteria |
| Query overdue quét bảng lớn mỗi phút | Trung bình (khi data lớn) | Trung bình | Where đã lọc `completed=false` + `dueAt < now` + prefilter ngày; đo `EXPLAIN`, thêm `@@index([completed, dueAt])` nếu cần (nêu ở Phase 1 Risk) |
| Crash giữa "gửi" và "updateMany" → gửi lặp sau restart | Thấp | Thấp | Chấp nhận; cửa sổ vài trăm ms |
| Task tạo ra đã quá hạn sẵn nhận cả `task_reminder` lẫn `task_overdue` | Trung bình | Thấp | Hành vi chấp nhận được (2 push khác nội dung); không thêm điều kiện chặn để giữ đúng quyết định đã chốt |
| Nodemon restart liên tục lúc dev tạo nhiều scheduler | Thấp | Thấp | Mỗi restart là process mới, process cũ bị kill → không tích luỹ |

## Security Considerations

- Job chạy nền, **không** đi qua `auth-middleware` → phải tự scope: mọi message lấy `deviceToken`
  từ **chính** `task.user` (qua `include`), không bao giờ ghép token của user này với task của
  user khác. Verify bằng test 2 user song song ở Phase 5.
- Không expose endpoint nào để trigger cron từ ngoài (tránh bị lạm dụng gửi spam).
- Log không chứa `deviceToken`, không chứa nội dung `desc` của task.

## Next Steps

- Phase 4 (song song được): hook `task_updated` + script test thủ công.
- Phase 5: cập nhật docs + verify end-to-end 2 user trên thiết bị thật.
