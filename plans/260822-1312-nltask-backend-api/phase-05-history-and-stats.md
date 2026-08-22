---
title: "Phase 5: History & Stats"
status: todo
---

# Phase 5: History & Stats

## Overview

- Priority: P1
- Status: Pending
- 2 endpoint đọc-only, tính toán tổng hợp từ bảng `tasks` của user hiện tại: lịch sử công việc
  đã hoàn thành (search + group theo ngày) và thống kê tuần (completion rate, streak, weekBars,
  category breakdown).

## Key Insights

- Tất cả logic ở đây suy trực tiếp từ `renderVals()` trong UI demo (dòng ~598-647 của
  `NLTASK Desktop.dc.html`): `allCompletedTasks`, `groupsMap` (group theo "Hôm nay"/"Hôm
  qua"/ngày cụ thể), `weekBars` (đếm complete theo từng ngày T2-CN), `completionRateWeek`
  (dựa trên task có `dueAt` trong tuần, không phải `completedAt`), `streakDays` (đếm ngược từ
  hôm nay, ngày nào có ít nhất 1 task complete thì +1, gặp ngày trống thì dừng, tối đa quét 60
  ngày lùi).
- Label nhóm ngày ("Hôm nay"/"Hôm qua"/khác) **không** tính ở backend theo đúng nguyên tắc
  "backend trả raw data" — backend trả `completedAt` ISO + field `dateKey` (yyyy-mm-dd theo
  APP_TIMEZONE) để client tự nhóm/label theo ngôn ngữ hiển thị. Đây là điểm khác nhẹ so với UI
  demo (UI demo tính label ngay trong state vì nó là monolith), nhưng đúng ranh giới
  responsibility đã chốt ở brainstorm.
- `weekBars` cần label thứ trong tuần (T2..CN) — cũng để backend trả `dateKey` +
  `weekdayIndex` (0=T2..6=CN) thay vì chuỗi tiếng Việt cứng, để nhất quán nguyên tắc không làm
  presentation ở backend.

## Requirements

- [x] `GET /api/history?search=<q>` — trả danh sách task completed của user, sort
  `completedAt desc`, có filter theo `title` chứa `search` (case-insensitive)
- [x] `GET /api/stats/week` — trả `completionRateWeek`, `streakDays`, `weekBars[]`,
  `categoryBreakdown[]`

## Architecture

```
src/
├── routes/
│   ├── history-routes.js
│   └── stats-routes.js
├── controllers/
│   ├── history-controller.js
│   └── stats-controller.js
└── services/
    ├── history-service.js
    └── stats-service.js
```

## Related Code Files

**Tạo mới:**
- `backend/src/services/history-service.js`
- `backend/src/controllers/history-controller.js`
- `backend/src/routes/history-routes.js`
- `backend/src/services/stats-service.js`
- `backend/src/controllers/stats-controller.js`
- `backend/src/routes/stats-routes.js`

**Sửa:**
- `backend/src/app.js` — mount `/api/history` và `/api/stats`, cả 2 sau `authMiddleware`

## Implementation Steps

1. `history-service.js`:
   - `getHistory(userId, search)`: `prisma.task.findMany({where:{userId, completed:true,
     ...(search && {title:{contains:search}})}, orderBy:{completedAt:'desc'}})`
   - Map mỗi task: trả field gốc (id, title, category (mapped lowercase), completedAt ISO) +
     `dateKey` = format `completedAt` theo `APP_TIMEZONE` dạng `YYYY-MM-DD` (dùng chung
     helper mới `formatDateKey(date)` thêm vào `date-range-utils.js` từ phase 4 — không tạo
     file util trùng lặp).
   - Response tổng: `{totalCount, items: [...]}` — client tự group theo `dateKey` để tái tạo
     UI "Hôm nay/Hôm qua/...".
2. `stats-service.js`:
   - `getWeekStats(userId, now)`:
     - `weekRange = getWeekRange(now)` (từ `date-range-utils.js`, phase 4)
     - `weekTasks = findMany({where:{userId, dueAt:{gte:weekRange.start, lt:weekRange.end}}})`
     - `completionRateWeek = weekTasks.length ? round(completedCount/weekTasks.length*100) : 0`
     - `weekBars`: với mỗi ngày `i` trong 0..6 (T2..CN) của tuần, đếm
       `tasks.filter(t=>t.completed && sameDay(t.completedAt, day_i))` — thực hiện bằng 1 query
       `findMany` completed trong khoảng `[weekRange.start, weekRange.end)` theo `completedAt`
       rồi group trong JS theo `dateKey` (đơn giản hơn 7 query riêng, dữ liệu 1 tuần nhỏ nên
       không cần tối ưu SQL group-by).
     - `streakDays`: query completed tasks trong 60 ngày gần nhất
       (`completedAt >= now-60days`), group theo `dateKey` trong JS, rồi đếm ngược từ hôm nay
       tới khi gặp ngày trống — giữ đúng thuật toán UI demo (dừng khi gặp ngày đầu tiên không
       có task complete).
     - `categoryBreakdown`: group toàn bộ completed task (không giới hạn tuần, khớp UI dùng
       `allCompletedTasks`) theo `category`, đếm + tính `%` trên tổng completed (tối thiểu mẫu
       số 1 để tránh chia 0, giống UI `Math.max(1, total)`).
3. `history-controller.js`/`stats-controller.js`: controller mỏng, validate `search` optional
   string, gọi service với `req.user.id` và `new Date()`.
4. Route file 2 dòng mount GET tương ứng.

## Todo

- [x] Thêm `formatDateKey(date)` vào `date-range-utils.js` (không tạo file mới)
- [x] `history-service.js` + controller + route
- [x] `stats-service.js` (rate/streak/weekBars/categoryBreakdown) + controller + route
- [x] Mount cả 2 route trong `app.js`

## Success Criteria

- `GET /api/history?search=báo` chỉ trả task có "báo" trong title (không phân biệt hoa/thường)
- `weekBars` trả đủ 7 phần tử, tổng `count` các ngày = số task hoàn thành có `completedAt`
  trong tuần đó (verify thủ công với dữ liệu seed)
- `streakDays` tính đúng khi có dữ liệu completed liên tiếp nhiều ngày và dừng đúng khi có
  ngày trống
- `categoryBreakdown` tổng `pct` các category xấp xỉ 100 (làm tròn có thể lệch nhẹ, chấp nhận
  được, giống UI demo dùng `Math.round`)

## Risk Assessment

- **Rủi ro:** `streakDays` quét 60 ngày bằng vòng lặp JS sau khi đã có data trong memory —
  nếu user có rất nhiều task, cần đảm bảo query completed 60 ngày chỉ lấy field cần thiết
  (`select: {completedAt:true}`) để tránh tải dư dữ liệu. **Giảm thiểu:** dùng `select` thay vì
  lấy full record trong 2 hàm streak/weekBars.

## Security Considerations

- Không khác gì phase 4 — mọi query đều `where: {userId}` từ `req.user.id`.

## Next Steps

- Phase 6 (Settings) độc lập, có thể làm song song với phase này.
