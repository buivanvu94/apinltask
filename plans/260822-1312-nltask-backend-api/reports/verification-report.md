# Verification Report - NLTASK Backend API

Ngày: 2026-08-22. Backend chạy trên MariaDB 11.8 local (`DATABASE_URL` do user tự cấu hình
trong `backend/.env`, không lưu trong repo).

## 1. Migrate

`npx prisma migrate dev --name init` — PASS. Tạo migration `20260822063159_init`, áp dụng
thành công lên DB `nltask`, đủ 4 bảng `users/tasks/settings/refresh_tokens`.

## 2. Smoke test tự động (thay cho checklist curl thủ công)

Thay vì gõ tay từng curl, viết 1 script Node (`fetch` built-in) chạy tuần tự 28 case bám sát
checklist phase 7 + acceptance criteria trong `plan.md`. Không phải bộ test tự động lưu trong
repo (đúng scope "manual smoke test" của plan) — chỉ là công cụ chạy checklist 1 lần, không
commit vào `backend/`.

| # | Case | Kết quả |
|---|---|---|
| 1 | `GET /health` | PASS |
| 2 | Login sai password → 401 | PASS |
| 3 | Login admin đúng password → token hợp lệ | PASS |
| 4 | `GET /api/auth/me` không token → 401 | PASS |
| 5 | `GET /api/auth/me` có token → đúng user | PASS |
| 6 | Admin tạo user thường → 201 | PASS |
| 7 | User mới login được ngay | PASS |
| 8 | User thường gọi `/api/users` → 403 | PASS |
| 9 | Admin list users, không lộ `passwordHash` | PASS |
| 10 | Refresh token hợp lệ → cặp token mới | PASS |
| 11 | Refresh token cũ dùng lại (đã rotate) → 401 | PASS |
| 12 | Tạo task overdue/today/upcoming, phân nhóm đúng `dueAt`/`now` | PASS |
| 13 | Filter `?category=work` | PASS |
| 14 | `GET /api/tasks/summary` đủ 4 field | PASS |
| 15 | Toggle complete set/clear `completedAt` | PASS |
| 16 | User B không GET/PATCH/DELETE được task User A → 404 | PASS |
| 17 | `GET /api/history?search=` filter đúng, có `dateKey` | PASS |
| 18 | `GET /api/stats/week` đủ field rate/streak/weekBars(7)/categoryBreakdown | PASS |
| 19 | `GET/PATCH /api/settings` upsert-default + partial update | PASS |
| 20 | `PATCH /api/settings` field invalid (`remindBefore:999`) → 400 | PASS |
| 21 | Admin reset password user → refresh token cũ chết, password mới hoạt động | PASS |
| 22 | Xoá admin cuối cùng → 400 (bị chặn) | PASS |
| 23 | Admin xoá user thường → cascade, 204 | PASS |
| 24 | Logout → 204 | PASS |

**28/28 case PASS** (một số case gộp nhiều assertion). Chạy lại toàn bộ sau khi áp dụng fix từ
code review — vẫn 28/28 PASS, không có regression.

## 3. Code review (subagent `code-reviewer`)

Review toàn bộ `backend/src/**` + `prisma/schema.prisma` đối chiếu plan + 7 phase file. Kết quả
và fix đã áp dụng:

| # | Mức độ | Finding | Fix |
|---|---|---|---|
| 1 | High | Race condition ở `assertNotLastAdmin` (check-then-act 2 query riêng, 2 admin cuối cùng có thể bị demote/xoá đồng thời) | Wrap `updateUser`/`deleteUser` trong `prisma.$transaction`, dùng raw SQL `SELECT ... FOR UPDATE` để khoá row admin trong lúc kiểm tra + ghi |
| 2 | High | Refresh token reuse race (`findUnique` rồi `update` riêng, replay đồng thời có thể mint 2 cặp token từ 1 token) | Đổi sang `updateMany({where:{id, revokedAt:null}})`, check `count===0` → 401 |
| 3 | Medium | Lỗi Prisma (P2025/P2002) không map sang 404/409, rơi vào 500 | Thêm mapping trong `error-handler.js` |
| 4 | Medium | Thiếu `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong required env; `start()` không có `.catch` → unhandled rejection khi bootstrap admin lỗi | Thêm vào `REQUIRED_KEYS`; thêm `.catch` trong `server.js` |
| 5 | Medium | `addDays` cộng cứng 24h, sai lệch nếu `APP_TIMEZONE` là zone có DST (mặc định `Asia/Ho_Chi_Minh` không DST nên hiện tại không bị ảnh hưởng) | Thêm `addZonedDays` tính lại offset theo ngày mới, dùng ở `getTodayRange`/`getWeekRange`/`stats-service` |
| 6 | Low | `GET /api/auth/me` trả `200 null` nếu user đã bị xoá nhưng access token còn hạn | Trả 401 nếu không tìm thấy user |
| 7 | Low | Case-insensitive search phụ thuộc collation DB, không phải logic code | Ghi chú comment giải thích, không đổi hành vi (đúng với MySQL/MariaDB mặc định) |

Không có finding nào bị bỏ qua.

## 4. Kết luận

Toàn bộ Success Criteria trong `plan.md` đạt. Backend sẵn sàng tích hợp frontend.

## Câu hỏi chưa giải quyết

- `APP_TIMEZONE` có khi nào cần set sang zone có DST không, hay `Asia/Ho_Chi_Minh` là target
  triển khai duy nhất? (ảnh hưởng độ ưu tiên của finding #5, đã fix theo hướng tổng quát nên
  không chặn, nhưng đáng xác nhận nếu roadmap mở rộng đa múi giờ)
- Nhiều admin thao tác đồng thời có phải kịch bản thực tế cần lo hay hệ thống chỉ có 1 admin
  trong thực tế? (đã fix race condition #1/#2 theo hướng an toàn nhất dù xác suất xảy ra thấp)
