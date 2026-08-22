---
title: "Phase 7: Docs & Verification"
status: todo
---

# Phase 7: Docs & Verification

## Overview

- Priority: P2
- Status: Pending
- Viết docs vận hành (setup/run) theo quy ước dự án (`docs/`), và verify thủ công toàn bộ
  endpoint của phase 2-6 bằng kịch bản curl/Postman theo đúng acceptance criteria trong
  `plan.md`.

## Key Insights

- Dự án dùng quy ước docs cố định tại `D:/DU_AN_NODEJS/2026/NLTASK/docs/` — chỉ tạo/sửa file
  cần thiết, không tạo thêm markdown rải rác ngoài `docs/`/`plans/`.
- Không có test framework nào được yêu cầu trong scope gốc — verification ở phase này là
  **manual smoke test theo checklist**, không phải viết bộ test tự động (giữ đúng phạm vi đã
  chốt, tránh scope creep). Nếu muốn test tự động, đó là yêu cầu bổ sung nằm ngoài plan này.

## Requirements

- [x] `docs/system-architecture.md` (hoặc cập nhật nếu đã tồn tại) — mô tả kiến trúc backend,
  Prisma schema, luồng auth
- [x] `docs/deployment-guide.md` — hướng dẫn setup MySQL, `.env`, migrate, chạy dev/prod
- [x] Chạy checklist verify thủ công toàn bộ endpoint, ghi kết quả vào report

## Related Code Files

**Tạo/sửa:**
- `docs/system-architecture.md`
- `docs/deployment-guide.md`
- `backend/README.md` (quick-start ngắn, trỏ sang `docs/` cho chi tiết)

## Implementation Steps

1. Viết `backend/README.md`: mô tả ngắn stack, lệnh `npm install`, `cp .env.example .env`
   (điền `DATABASE_URL` MySQL thật), `npx prisma migrate dev`, `npm run dev`.
2. Viết `docs/deployment-guide.md`: chi tiết hơn README — cách chạy MySQL local nhanh nhất
   (gợi ý Docker `docker run mysql:8` hoặc dùng MySQL đã cài sẵn), full danh sách biến môi
   trường và ý nghĩa, cách reset DB (`prisma migrate reset`) kèm cảnh báo mất dữ liệu (đúng
   rule "luôn backup trước khi đổi schema/dữ liệu" — ghi rõ lệnh backup `mysqldump` trước khi
   migrate/reset trên DB có dữ liệu thật).
3. Viết `docs/system-architecture.md`: sơ đồ thư mục `backend/src/*`, danh sách toàn bộ
   endpoint theo module (auth/users/tasks/history/stats/settings) kèm role yêu cầu (public /
   authenticated / admin-only), tham chiếu Prisma schema.
4. Verify checklist (chạy thủ công qua curl, ghi PASS/FAIL vào report tại
   `plans/260822-1312-nltask-backend-api/reports/`):
   - [x] Boot server lần đầu (DB rỗng) → admin tự tạo
   - [x] Login admin đúng/sai password
   - [x] Admin tạo user thường → user login được
   - [x] User thường gọi `/api/users` → 403
   - [x] Admin reset password user → refresh token cũ chết, password mới hoạt động
   - [x] Admin xoá user → cascade xoá task/settings, không xoá được nếu là admin cuối cùng
   - [x] User A tạo task, User B không thấy/không sửa/không xoá được task của A
   - [x] Toggle complete set/clear đúng `completedAt`
   - [x] `GET /api/tasks?scope=overdue|today|upcoming` trả đúng nhóm theo `dueAt`/`now`
   - [x] `GET /api/tasks/summary` khớp số liệu thực tế trong DB
   - [x] `GET /api/history?search=` filter đúng, trả `dateKey` hợp lệ
   - [x] `GET /api/stats/week` — weekBars/streak/categoryBreakdown/completionRate hợp lý với
     dữ liệu test
   - [x] `GET/PATCH /api/settings` hoạt động, partial update đúng field
5. Nếu phát hiện lỗi trong lúc verify, quay lại phase tương ứng sửa (không patch tạm ở phase
   7), rồi verify lại.

## Todo

- [x] `backend/README.md`
- [x] `docs/deployment-guide.md`
- [x] `docs/system-architecture.md`
- [x] Chạy đủ checklist verify, ghi report kết quả

## Success Criteria

- Người khác (không phải người viết code) đọc `backend/README.md` + `docs/deployment-guide.md`
  là chạy được server từ đầu, không cần hỏi thêm
- Toàn bộ checklist verify PASS
- `plan.md` mọi mục Success Criteria được tick xong

## Risk Assessment

- **Rủi ro:** verify thủ công dễ bỏ sót case biên (ví dụ task đúng ranh giới nửa đêm).
  **Giảm thiểu:** checklist liệt kê rõ từng case biên quan trọng (last-admin, cross-user leak,
  refresh token rotation) thay vì chỉ test happy path.

## Security Considerations

- Đảm bảo `.env` thật (chứa `ADMIN_PASSWORD`, JWT secrets, `DATABASE_URL` có credential DB)
  không bị commit — kiểm tra `git status`/`.gitignore` trước khi kết thúc phase (nếu repo đã
  init git; hiện tại repo chưa phải git repo, ghi chú nhắc user init git + gitignore đúng nếu
  sau này commit).

## Next Steps

- Sau phase này, backend NLTASK sẵn sàng để tích hợp với frontend thật (ngoài phạm vi plan
  này).
