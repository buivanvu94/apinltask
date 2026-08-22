---
title: "Phase 4: Tasks Module (CRUD)"
status: todo
---

# Phase 4: Tasks Module (CRUD)

## Overview

- Priority: P1
- Status: Pending
- CRUD task + toggle complete + summary (today/overdue/upcoming counts), scope tuyệt đối theo
  `req.user.id`. Đây là module lõi, tương ứng phần "Hôm nay" của UI.

## Key Insights

- UI có 3 nhóm hiển thị trên tab "Hôm nay": quá hạn (`dueAt < now`, chưa complete), hôm nay
  (`isSameDay(dueAt, now)`, chưa complete, `dueAt >= now`), sắp tới (`dueAt > cuối ngày hôm
  nay`, chưa complete). Backend cung cấp 1 endpoint list linh hoạt qua query param thay vì 3
  endpoint cứng, để client tự quyết hiển thị — nhưng vẫn cung cấp `GET /api/tasks/summary`
  trả sẵn counts đúng logic UI vì đó là phép tính lặp lại nhiều nơi (card số liệu).
- Filter category trên UI là "all" hoặc 1 trong 5 category — map sang query param
  `?category=work` (bỏ qua param nếu `all`).
- Toggle complete phải tự set/xoá `completedAt` (giống logic UI: complete→set `new Date()`,
  uncomplete→`null`), không nhận `completedAt` từ client.
- Validate `category`/`priority`/`repeat` theo đúng 5/3/3 giá trị lowercase mà UI dùng
  (`work|personal|study|health|other`, `low|medium|high`, `none|daily|weekly`) ở tầng
  controller (zod enum), map sang Prisma enum UPPERCASE ở service — 1 hàm mapping 2 chiều dùng
  chung, tránh lặp code ở History/Stats module (phase 5).

## Requirements

- [x] `GET /api/tasks?scope=overdue|today|upcoming|all&category=<key>` — mặc định `scope=all`
- [x] `GET /api/tasks/summary` — `{todayTotalCount, todayCompletedCount, overdueCount, upcomingCount}`
- [x] `GET /api/tasks/:id` — 404 nếu không thuộc user hiện tại (không phải 403, để không lộ
  tồn tại của record)
- [x] `POST /api/tasks` — tạo task, `userId` lấy từ `req.user.id`, không nhận từ body
- [x] `PATCH /api/tasks/:id` — sửa field (title/desc/category/priority/repeat/location/dueAt)
- [x] `PATCH /api/tasks/:id/toggle` — toggle `completed`, auto set/clear `completedAt`
- [x] `DELETE /api/tasks/:id`

## Architecture

```
src/
├── utils/
│   ├── enum-mapper.js       # map lowercase API key <-> Prisma enum UPPERCASE, dùng chung phase 4/5
│   └── date-range-utils.js  # todayRange(), weekRange() theo APP_TIMEZONE, dùng chung phase 4/5
├── routes/
│   └── tasks-routes.js
├── controllers/
│   └── tasks-controller.js
└── services/
    └── tasks-service.js
```

## Related Code Files

**Tạo mới:**
- `backend/src/utils/enum-mapper.js`
- `backend/src/utils/date-range-utils.js`
- `backend/src/services/tasks-service.js`
- `backend/src/controllers/tasks-controller.js`
- `backend/src/routes/tasks-routes.js`

**Sửa:**
- `backend/src/app.js` — mount `app.use('/api/tasks', authMiddleware, tasksRoutes)`

## Implementation Steps

1. `enum-mapper.js`: object map 2 chiều cho `category`, `priority`, `repeat`
   (`{work: 'WORK', personal: 'PERSONAL', ...}` và ngược lại), export `toDbEnum(kind, value)` /
   `fromDbEnum(kind, value)`, throw nếu `value` không nằm trong danh sách hợp lệ.
2. `date-range-utils.js`: dùng `Intl.DateTimeFormat` hoặc thư viện nhẹ (`date-fns-tz` nếu cần)
   để tính, theo `APP_TIMEZONE` từ env:
   - `getTodayRange(now)` → `{start, end}` (00:00:00 → 23:59:59.999 ngày hiện tại theo TZ)
   - `getWeekRange(now)` → `{start, end}` tuần từ Thứ 2 → Chủ Nhật (khớp `weekStart` trong UI
     dùng `(now.getDay()+6)%7`)
3. `tasks-service.js`:
   - `listTasks(userId, {scope, category})`:
     - base where: `{userId}`, thêm `category: toDbEnum('category', category)` nếu có.
     - `scope=overdue`: `completed:false, dueAt: {lt: now}`
     - `scope=today`: `completed:false, dueAt: {gte: now, lte: todayRange.end}` — vẫn phải
       nằm trong ngày hôm nay (không lấy hôm nay đã qua giờ, đúng logic UI `isSameDay &&
       dueAt>=now`) — combine: `dueAt: {gte: max(now, todayRange.start), lte: todayRange.end}`,
       thực tế `now >= todayRange.start` luôn đúng nên dùng `gte: now`.
     - `scope=upcoming`: `completed:false, dueAt: {gt: todayRange.end}`, order `dueAt asc`
     - `scope=all` (default): không filter thêm theo completed/dueAt, order `dueAt asc`
     - map mỗi record qua `fromDbEnum` trước khi trả (client nhận lowercase key).
   - `getSummary(userId)`: 1 lần query `findMany` các task liên quan hôm nay/quá hạn/sắp tới
     (hoặc 3-4 `count()` song song bằng `Promise.all` — ưu tiên cách này, đơn giản hơn tính tay
     trong JS) để trả 4 số.
   - `getTaskById(userId, id)`: `findFirst({where:{id, userId}})` — dùng `findFirst` với cả
     `userId` trong where (không phải `findUnique` rồi check owner sau) để 1 query duy nhất
     vừa lấy vừa enforce scope, tránh lỗi quên check owner.
   - `createTask(userId, data)`: map enum, `prisma.task.create({data:{...data, userId}})`.
   - `updateTask(userId, id, data)`: `updateMany({where:{id,userId}, data})`, check
     `count===0` → throw 404 (updateMany không lỗi khi không match, phải tự kiểm tra).
   - `toggleTask(userId, id)`: lấy task hiện tại (scoped), tính `completed` mới,
     `completedAt: completed ? new Date() : null`, update.
   - `deleteTask(userId, id)`: `deleteMany({where:{id,userId}})`, check `count===0` → 404.
4. `tasks-controller.js`: validate query/body qua zod, gọi service, map lỗi 404/400.
5. `tasks-routes.js`: khai báo route theo thứ tự cụ thể trước tổng quát (`/summary` phải khai
   trước `/:id` để Express không match nhầm `summary` thành `:id`).

## Todo

- [x] `enum-mapper.js`, `date-range-utils.js`
- [x] `tasks-service.js` đủ 7 hàm (list/summary/getById/create/update/toggle/delete)
- [x] `tasks-controller.js` + zod schema cho body/query
- [x] `tasks-routes.js`, mount vào `app.js`

## Success Criteria

- Tạo task với `dueAt` quá khứ, chưa complete → xuất hiện trong `scope=overdue`, không xuất
  hiện trong `scope=today`/`upcoming`
- Toggle complete → `completedAt` tự set; toggle lại → `completedAt` về `null`
- User A không `GET/PATCH/DELETE` được task của user B (404, không phải 500/403 lộ thông tin)
- `GET /api/tasks/summary` số liệu khớp thủ công đếm trong DB
- Filter `?category=work` chỉ trả task category work

## Risk Assessment

- **Rủi ro:** off-by-one khi tính "hôm nay" quanh nửa đêm nếu server timezone khác
  `APP_TIMEZONE`. **Giảm thiểu:** mọi tính toán ngày giờ đi qua `date-range-utils.js`, không
  dùng trực tiếp `new Date()` boundary rải rác trong service.

## Security Considerations

- Không có endpoint nào nhận `userId` từ client body/query — luôn lấy từ `req.user.id` sau
  middleware auth.

## Next Steps

- Phase 5 tái sử dụng `enum-mapper.js` + `date-range-utils.js` cho History/Stats.
