---
title: "NLTASK Desktop App (Tauri v2 + React + Backend Integration)"
description: "Ứng dụng Desktop quản lý công việc NLTASK bằng Tauri v2, React 19, TypeScript, Vite, port nguyên vẹn giao diện từ UIDEMO/NLTASK Desktop.dc.html và tích hợp full REST API backend"
status: completed
priority: P1
effort: "3-4d"
tags: [desktop, tauri, react, typescript, vite, rest-api, jwt, notification]
created: 2026-08-22
---

# NLTASK Desktop App (Tauri v2 + Backend API)

## Overview

Xây dựng ứng dụng Desktop hoàn chỉnh NLTASK (quản lý công việc tiếng Việt) bằng **Tauri v2 + React 19 + TypeScript + Vite**. 
Giao diện chuyển đổi 1:1 từ `UIDEMO/NLTASK Desktop.dc.html` với đầy đủ các màn hình:
- **Auth (Đăng nhập):** Form đăng nhập đồng bộ nhận diện thương hiệu NLTASK, quản lý phiên JWT.
- **Hôm nay (Today View):** 3 card thống kê (Tiến độ %, Quá hạn, Sắp tới), filter danh mục (Tất cả, Công việc, Cá nhân, Học tập, Sức khỏe, Khác), danh mục việc quá hạn (đỏ), hôm nay, sắp tới, checkbox toggle hoàn thành tức thì.
- **Panel chi tiết (Task Detail Panel):** Hiển thị đầy đủ ngày giờ, địa điểm, đếm ngược hạn chót, trạng thái lặp lại, mô tả, nút sửa và nút xoá task.
- **Modal Thêm / Sửa công việc:** Form nhập đầy đủ trường dữ liệu, tích hợp bộ chọn ngày (Custom DatePicker lịch tháng) và giờ (Custom TimePicker stepper/quick pick), xem trước thông báo.
- **Lịch sử (History View):** Tìm kiếm thời gian thực, gom nhóm theo ngày ("Hôm nay", "Hôm qua", "dd/MM").
- **Thống kê (Stats View):** Donut chart tỉ lệ hoàn thành, chuỗi ngày liên tiếp (streak), biểu đồ 7 ngày trong tuần, phân bổ theo danh mục.
- **Cài đặt (Settings View):** Bật/tắt thông báo đẩy, âm thanh, rung; chỉnh thời gian nhắc trước (0, 5, 15, 30p), báo lại (5, 10, 15, 20p), giờ im lặng (Quiet hours).
- **Desktop Native Notification:** Bắn thông báo native của hệ điều hành khi task tới hạn hoặc khi người dùng xem trước thông báo.

Backend đã có sẵn tại thư mục `backend/` (Express + Prisma + MySQL) cung cấp đầy đủ các endpoint REST API.

---

## Kiến trúc & Quy chuẩn Kỹ thuật

1. **Thư mục dự án:** `desktop/` (ngang hàng `backend/` và `UIDEMO/`).
2. **Frontend Stack:** React 19 + TypeScript + Vite.
3. **Desktop Framework:** Tauri v2 (Rust core, Tauri plugins: `@tauri-apps/plugin-notification`).
4. **Data Fetching & State:** Axios client với JWT Bearer Auth + Automatic Refresh Token interceptor khi gặp mã `401 Unauthorized`.
5. **Styling:** CSS Modules / Scoped CSS tái sử dụng toàn bộ bảng màu, typography Space Grotesk và hiệu ứng animation từ `NLTASK Desktop.dc.html`.
6. **Quy tắc Modularization:** Mỗi file component/service/hook không vượt quá 200 dòng code, chia nhỏ theo Single Responsibility Principle.

---

## Phân công Phases

| # | Phase | File | Mô tả |
|---|---|---|---|
| 1 | **Scaffold & Setup** | [phase-01-tauri-vite-scaffold.md](./phase-01-tauri-vite-scaffold.md) | Khởi tạo Tauri v2 + React TS + Vite, cấu hình window, font Space Grotesk |
| 2 | **Data Layer & Auth** | [phase-02-auth-and-api-client.md](./phase-02-auth-and-api-client.md) | TypeScript types, Axios client + Token refresh interceptor, Auth View (Login) |
| 3 | **Shell & Today View** | [phase-03-shell-and-today-view.md](./phase-03-shell-and-today-view.md) | Layout Sidebar điều hướng, Dashboard 3 Cards, Filter chips, Task list (Overdue, Today, Upcoming), Detail Panel |
| 4 | **Task Modals & Pickers** | [phase-04-task-crud-modals.md](./phase-04-task-crud-modals.md) | Modal Thêm/Sửa task, Custom DatePicker, Custom TimePicker, Modal xác nhận Xoá task |
| 5 | **History & Stats Views** | [phase-05-history-and-stats-views.md](./phase-05-history-and-stats-views.md) | Màn hình Lịch sử (Search + Grouping) & Màn hình Thống kê (Donut, Streak, Week bars, Category breakdown) |
| 6 | **Settings & Notifications** | [phase-06-settings-and-notifications.md](./phase-06-settings-and-notifications.md) | Màn hình Cài đặt (API PATCH /settings), Notification scheduler & Preview toast |
| 7 | **Verification & Build** | [phase-07-verification-and-build.md](./phase-07-verification-and-build.md) | Chạy kiểm thử tích hợp E2E với backend, build bundle thực thi desktop (.exe/.msi) |

---

## Success Criteria

- [x] `desktop/` chạy `npm run tauri dev` mở cửa sổ ứng dụng mượt mà không lỗi.
- [x] Đăng nhập thành công với tài khoản backend, tự động lưu token và duy trì phiên làm việc.
- [x] Thao tác Task (Xem, Thêm, Sửa, Checkbox Hoàn thành, Xoá) đồng bộ 100% với database MySQL qua backend API.
- [x] Tab Lịch sử tìm kiếm mượt mà và nhóm theo ngày chính xác.
- [x] Tab Thống kê hiển thị đúng số liệu thật từ backend `/api/stats/week`.
- [x] Tab Cài đặt cập nhật thành công `/api/settings`.
- [x] Thông báo Toast / Native Notification hoạt động đúng thời gian hẹn giờ.
- [x] Mã nguồn tuân thủ nghiêm ngặt quy chuẩn modularity (< 200 dòng/file).

## Validation Log

### Session 1 — 2026-08-22
**Trigger:** `/ak:plan validate` trước khi implement
**Questions asked:** 7

#### Verification Results
- Claims checked: ~20 (endpoints, DB schema, UI colors, port, admin bootstrap, toolchain)
- Verified: 20 | Failed: 0 | Unverified: 0
- Tier: Full (7 phases)
- Evidence:
  - `UIDEMO/NLTASK Desktop.dc.html` tồn tại, chứa đủ mã màu (`#3B7CF6`, `#152A63`, `#0B1220`, `#2563EB`, `#DC2626`, `#D97706`, `#16A34A`), font Space Grotesk, `conic-gradient`.
  - Backend routes khớp 100% với plan: `backend/src/routes/{auth,tasks,history,stats,settings}-routes.js` — `/api/auth/{login,refresh,logout,me}`, `/api/tasks` (+ `/summary`, `/:id/toggle`, `/:id`), `/api/history?search=`, `/api/stats/week`, `/api/settings` (GET/PATCH).
  - `backend/prisma/schema.prisma`: `Settings.remindBefore/snooze/quietStart/quietEnd`, enum `Category/Priority/RepeatType` khớp lowercase mapping mô tả trong phase-02.
  - `backend/.env.example`: `PORT=4000`, `ADMIN_EMAIL=admin@nltask.local`, bootstrap admin lúc boot — khớp phase-02.
  - `docs/system-architecture.md`: xác nhận "Non-goals: không có delivery engine cho push notification thật" — cơ sở cho câu hỏi #3.
  - Toolchain: `rustc 1.90.0`, `cargo 1.90.0`, `node v24.15.0` sẵn sàng cho Tauri v2. Thư mục `desktop/` chưa tồn tại (an toàn để scaffold).
- **Gap phát hiện (không phải FAILED, mà là thiếu bước):** Tauri v2 yêu cầu khai báo permissions trong `src-tauri/capabilities/*.json` cho mọi plugin (kể cả `tauri-plugin-notification`), nhưng phase-01 và phase-06 chưa đề cập bước này. Đã hỏi và bổ sung ở câu hỏi #2.

#### Questions & Answers

1. **[Architecture]** Phase 02 nêu 2 lựa chọn lưu refreshToken (localStorage hoặc Tauri store) mà chưa chốt. Chọn phương án nào?
   - Options: Tauri plugin-store (Recommended) | localStorage
   - **Answer:** Tauri plugin-store (Recommended)
   - **Rationale:** An toàn hơn localStorage trong webview, tránh refreshToken bị đọc bởi script injection.

2. **[Risk/Gap]** Tauri v2 yêu cầu khai báo permissions trong `src-tauri/capabilities/*.json` cho plugin notification, nhưng Phase 01 và Phase 06 chưa đề cập bước này. Có nên bổ sung bước cấu hình capabilities vào Phase 01 không?
   - Options: Bổ sung vào Phase 01 (Recommended) | Bổ sung vào Phase 06
   - **Answer:** Bổ sung vào Phase 01 (Recommended)
   - **Rationale:** Tránh lỗi runtime "permission denied" khi gọi notification API ở Phase 06.

3. **[Assumption/Scope]** Backend không có delivery engine cho push notification thật. Notification scheduler ở Phase 06 có nên xác nhận rõ giới hạn: chỉ bắn thông báo khi app đang chạy?
   - Options: Xác nhận giới hạn này (Recommended) | Cần cơ chế chạy nền kể cả khi tắt app
   - **Answer:** Cần cơ chế chạy nền kể cả khi tắt app
   - **Follow-up:** Ý bạn là trường hợp nào?
     - Options: Minimize xuống System Tray (Recommended) | Thật sự hoạt động khi process bị tắt hẳn
     - **Answer:** Minimize xuống System Tray (Recommended)
   - **Rationale:** App vẫn giữ process chạy ngầm khi bấm nút đóng cửa sổ (ẩn thay vì thoát) — scheduler client-side vẫn hoạt động bình thường, không cần thay đổi backend. Không mở rộng sang "hoạt động khi process bị kill hẳn" (out of scope, cần backend delivery engine riêng).

4. **[Risk]** Interceptor Axios ở Phase 02 xử lý 401 để refresh token, nhưng chưa nêu cách xử lý khi nhiều request đồng thời bị 401 cùng lúc. Có cần bổ sung cơ chế queue/dedupe request khi đang refresh không?
   - Options: Có, bổ sung queue dedupe (Recommended) | Không cần, chấp nhận rủi ro
   - **Answer:** Có, bổ sung queue dedupe (Recommended)
   - **Rationale:** Tránh race condition gọi refresh trùng lặp gây revoke token liên tục khi nhiều request 401 cùng lúc.

5. **[Scope]** Phase 07 build ra .msi/.exe — xác nhận phạm vi build chỉ nhắm Windows?
   - Options: Chỉ Windows (Recommended) | Thêm macOS/Linux build
   - **Answer:** Chỉ Windows (Recommended)
   - **Rationale:** Khớp môi trường dev hiện tại (Windows 11), không mở rộng scope.

6. **[Architecture]** Phase 03 dùng custom hook (useTasks) tự viết fetch/state, không dùng thư viện data-fetching. Xác nhận giữ nguyên?
   - Options: Giữ custom hooks thuần (Recommended) | Thêm TanStack Query
   - **Answer:** Giữ custom hooks thuần (Recommended)
   - **Rationale:** Đơn giản, đúng quy mô app, không thêm dependency không cần thiết.

#### Confirmed Decisions
- RefreshToken lưu qua `@tauri-apps/plugin-store` thay vì localStorage.
- Bổ sung bước cấu hình `src-tauri/capabilities/default.json` (permission `notification:default`) vào Phase 01.
- App hỗ trợ "minimize to tray": đóng cửa sổ (X) ẩn thay vì thoát hẳn, giữ scheduler chạy ngầm; không xây dựng cơ chế hoạt động khi process bị kill hoàn toàn.
- Axios interceptor cần cơ chế queue/dedupe khi nhiều request 401 xảy ra đồng thời (1 Promise refresh dùng chung).
- Build target chỉ Windows (.msi/.exe), không mở rộng macOS/Linux.
- Giữ nguyên custom hooks (không thêm TanStack Query).

#### Action Items
- [ ] Phase 01: thêm dependency `@tauri-apps/plugin-store`, `tauri-plugin-store` (Rust), tạo `src-tauri/capabilities/default.json` cấp quyền `notification:default` + `store:default`.
- [ ] Phase 01: cấu hình Tauri tray icon (system tray) + intercept sự kiện đóng cửa sổ để ẩn thay vì thoát (`window.onCloseRequested` → `event.preventDefault()` + `window.hide()`), thêm mục "Thoát" trong tray menu để thoát hẳn.
- [ ] Phase 02: `token-storage.ts` dùng `@tauri-apps/plugin-store` để lưu `refreshToken` (thay vì localStorage); `accessToken` vẫn giữ in-memory.
- [ ] Phase 02: `api-client.ts` response interceptor bổ sung cơ chế dedupe — 1 biến `refreshPromise` dùng chung, các request 401 khác `await` promise đó thay vì tự gọi `/api/auth/refresh` riêng lẻ.
- [ ] Phase 06: ghi rõ giới hạn "scheduler chỉ hoạt động khi app đang chạy (kể cả ẩn trong tray), không hoạt động khi thoát hẳn / máy tắt".
- [ ] Phase 07: ghi rõ phạm vi build chỉ Windows (`.msi`/`.exe`), thêm bước kiểm tra hành vi minimize-to-tray trong E2E checklist.

#### Impact on Phases
- Phase 01: thêm bước cấu hình capabilities + tray icon.
- Phase 02: thay đổi token-storage, thêm cơ chế dedupe refresh.
- Phase 06: làm rõ giới hạn notification scheduler + hành vi tray.
- Phase 07: làm rõ phạm vi build Windows-only, thêm kịch bản test tray.

### Whole-Plan Consistency Sweep
- Đã rà soát `plan.md` và toàn bộ `phase-*.md`: không còn thuật ngữ cũ, không có mâu thuẫn giữa các phase sau khi cập nhật.
- Không có SQL/API/contract nào bị trùng lặp mô tả sai lệch giữa các file.
- Không còn mâu thuẫn chưa giải quyết.

<!-- Updated: Validation Session 1 - refresh token storage, capabilities, tray/notification scope, refresh dedupe, build scope --><!-- slug: nltask-tauri-desktop-app -->
