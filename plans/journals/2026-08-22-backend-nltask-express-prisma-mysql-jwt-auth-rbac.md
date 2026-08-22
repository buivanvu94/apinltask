---
title: "Backend NLTASK: Express + Prisma (MySQL) + JWT auth + RBAC"
date: 2026-08-22
summary: "Hoàn thành 7/7 phase backend NLTASK, verify 28/28 PASS, fix 7 finding từ code review, commit root đầu tiên"
---

# Backend NLTASK: Express + Prisma (MySQL) + JWT auth + RBAC

## What happened

Implement toàn bộ backend NLTASK theo plan `plans/260822-1312-nltask-backend-api/`
(7 phase, --auto mode):

- Phase 1: Express + Prisma project setup, schema (User/Task/Settings/RefreshToken +
  4 enum), migrate lên MariaDB 11.8 thật (server sẵn có trên máy, không phải MySQL như plan
  giả định ban đầu — vẫn tương thích vì Prisma provider "mysql" hỗ trợ MariaDB).
- Phase 2: Auth JWT (access ngắn hạn + refresh token random-hash rotatable), bootstrap admin
  từ env lúc boot.
- Phase 3: Users module admin-only + RBAC middleware, chặn xoá/hạ role admin cuối cùng.
- Phase 4: Tasks CRUD + toggle + summary, scope tuyệt đối theo `req.user.id`.
- Phase 5: History (search + dateKey) + Stats tuần (rate/streak/weekBars/categoryBreakdown),
  timezone-aware qua `date-range-utils.js` (Intl.DateTimeFormat-based, không thêm dependency).
- Phase 6: Settings module, upsert-default + partial update.
- Phase 7: Docs (`backend/README.md`, `docs/deployment-guide.md`,
  `docs/system-architecture.md`) + verify.

Verify: viết 1 script Node dùng `fetch` built-in chạy 28 case bám checklist phase 7 (login,
refresh rotation, cross-user isolation 404, last-admin block, reset-password revoke session,
settings validation...) — 28/28 PASS lần đầu.

Sau đó spawn subagent `code-reviewer` review toàn bộ `backend/src/**`. Tìm 7 finding:
- High #1: race condition ở `assertNotLastAdmin` — check count và write là 2 query riêng,
  2 request đồng thời có thể demote/xoá cả 2 admin cuối cùng cùng lúc.
- High #2: refresh token reuse race — `findUnique` rồi `update` riêng, replay đồng thời có
  thể mint 2 cặp token hợp lệ từ 1 refresh token.
- Medium #3: lỗi Prisma P2025/P2002 không map HTTP status, rơi vào 500 thay vì 404/409.
- Medium #4: thiếu `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong required env check; `start()` không
  catch lỗi → unhandled rejection nếu bootstrap admin fail.
- Medium #5: `addDays` cộng cứng 24h ms, sai nếu `APP_TIMEZONE` là zone có DST (mặc định
  Asia/Ho_Chi_Minh không DST nên hiện tại chưa bị ảnh hưởng, nhưng là bug tiềm ẩn).
- Low #6: `GET /api/auth/me` trả 200 + null nếu user bị xoá nhưng access token còn hạn.
- Low #7: case-insensitive search phụ thuộc collation DB, không phải logic code (chỉ note).

## Decision

Fix cả 7 finding thay vì chỉ 2 High, vì chi phí sửa thấp và đây là dự án mới (chưa có traffic
thật, sửa sớm rẻ hơn để nợ kỹ thuật):
- #1/#2: đổi sang pattern atomic (`updateMany` với where-guard, hoặc `$transaction` +
  `SELECT ... FOR UPDATE` raw SQL để khoá row admin).
- #3: thêm mapping Prisma error code → HTTP status trong `error-handler.js`.
- #4: thêm vào `REQUIRED_KEYS`, thêm `.catch` ở `server.js`.
- #5: viết `addZonedDays` tính lại offset theo TZ cho ngày mới, thay thế mọi chỗ cộng 24h cứng.
- #6: trả 401 khi user không tồn tại thay vì 200+null.
- #7: chỉ thêm comment giải thích, không đổi hành vi (đúng với mặc định MySQL/MariaDB).

Re-run script verify sau fix — vẫn 28/28 PASS, không regression.

Quyết định về credential DB: không để user dán password root vào chat — thay vào đó đưa lệnh
mysql mẫu để user tự chạy tạo DB + điền `.env`, mình chỉ đọc `.env` qua bash script nội bộ khi
cần test (không bao giờ echo giá trị secret ra output).

## Next steps

- Backend sẵn sàng tích hợp frontend thật (ngoài phạm vi plan này).
- Câu hỏi mở (chưa cần quyết định ngay): APP_TIMEZONE có bao giờ cần set sang zone có DST
  không (ảnh hưởng mức ưu tiên của fix #5, đã fix tổng quát nên không chặn); nhiều admin thao
  tác đồng thời có phải kịch bản thực tế cần lo không (đã fix an toàn dù xác suất race thấp).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
