# Phase 01: Tauri v2 + React TypeScript Scaffold & Setup

## Mục tiêu
Khởi tạo cấu trúc dự án desktop tại thư mục `desktop/` sử dụng Tauri v2 kết hợp React 19 + TypeScript + Vite. Cấu hình cửa sổ ứng dụng, import font Space Grotesk và reset CSS cơ bản theo đúng mẫu `UIDEMO/NLTASK Desktop.dc.html`.

## Các bước thực hiện

1. **Khởi tạo project Vite + React + TypeScript:**
   - Tạo thư mục `desktop/`.
   - Setup `package.json` với các dependencies: `react`, `react-dom`, `axios`, `@tauri-apps/api`, `@tauri-apps/plugin-notification`, `@tauri-apps/plugin-store`.
   - Cấu hình `vite.config.ts` (server port 1420, clearScreen: false, envPrefix: ['VITE_', 'TAURI_']).
   - Setup `tsconfig.json` và `tsconfig.node.json`.

2. **Khởi tạo Tauri v2 Core (`desktop/src-tauri`):**
   - Tạo `src-tauri/Cargo.toml` với Tauri v2 dependencies (`tauri = "2"`, `tauri-plugin-notification = "2"`, `tauri-plugin-store = "2"`, `serde`, `serde_json`).
   - Cấu hình `src-tauri/tauri.conf.json`:
     - `productName`: "NLTASK"
     - `version`: "1.0.0"
     - `identifier`: "com.nltask.desktop"
     - `windows`: title = "NLTASK - Quản lý công việc", width = 1200, height = 800, minWidth = 1000, minHeight = 650, center = true, resizable = true.
     - `bundle`: icons chuẩn.
     - `trayIcon`: cấu hình icon system tray mặc định.
   - Tạo `src-tauri/capabilities/default.json` khai báo quyền `notification:default` và `store:default` (bắt buộc với Tauri v2 permission system, thiếu bước này sẽ gây lỗi "permission denied" khi gọi API notification/store ở runtime).
   - Viết `src-tauri/src/main.rs` và `src-tauri/src/lib.rs` để khởi động Tauri runtime, đăng ký plugin `tauri-plugin-notification` và `tauri-plugin-store`.
   - Cấu hình System Tray (`TrayIconBuilder`) với menu "Mở NLTASK" / "Thoát", và intercept sự kiện đóng cửa sổ (`WindowEvent::CloseRequested` → `api.prevent_close()` + ẩn cửa sổ) để app tiếp tục chạy ngầm thay vì thoát hẳn khi người dùng bấm nút X. Menu "Thoát" mới thực sự kết thúc process.

3. **Cấu hình Global Styles & Fonts:**
   - Viết `desktop/src/index.css`:
     - Nhúng font Google Fonts `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');`
     - Custom scrollbar (`::-webkit-scrollbar` thumb `rgba(15,23,42,.14)`).
     - Global keyframes: `modalPop` và `toastIn`.
     - Reset base styles (box-sizing, cursor, background `#F5F7FB`).

## Kiểm chứng (Verification)
- Chạy `npm install` trong `desktop/`.
- Chạy `npm run tauri dev` để xác nhận cửa sổ ứng dụng xuất hiện, giao diện nền và font chữ Space Grotesk tải thành công không có lỗi console hay Rust compile error.
- Bấm nút đóng cửa sổ (X): xác nhận app ẩn xuống system tray thay vì thoát hẳn; icon tray hiển thị đúng, menu "Mở NLTASK" / "Thoát" hoạt động.

<!-- Updated: Validation Session 1 - thêm plugin-store dependency, capabilities/default.json, system tray + close-to-tray behavior -->
