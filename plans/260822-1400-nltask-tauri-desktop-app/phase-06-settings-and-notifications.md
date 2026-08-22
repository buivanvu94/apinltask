# Phase 06: Settings Module & Desktop Native Notifications

## Mục tiêu
Xây dựng màn hình Cài đặt (Settings View) kết nối API `GET /api/settings` & `PATCH /api/settings`, kết hợp hệ thống thông báo Toast trên UI và Desktop Native Notification thông qua Tauri plugin.

## Các bước thực hiện

1. **Màn hình Cài đặt (`src/views/SettingsView.tsx`):**
   - Service: `src/services/settings-service.ts` (`getSettings()`, `updateSettings(data)`).
   - Hook: `src/hooks/useSettings.ts` quản lý state settings và debounce/optimistic update khi người dùng thay đổi thiết lập.
   - Nhóm 1 — **THÔNG BÁO & NHẮC NHỞ:**
     - Toggle switch "Thông báo đẩy" (`push`): Nhắc khi tới giờ công việc.
     - Toggle switch "Âm thanh" (`sound`).
     - Toggle switch "Rung" (`vibrate`).
     - Custom Switch Component bo tròn với hiệu ứng di chuyển nút knob mượt mà (`transition: transform .15s`).
   - Nhóm 2 — **NHẮC TRƯỚC KHI TỚI GIỜ (`remindBefore`):**
     - Danh sách pill button: `Đúng giờ` (0 phút), `5 phút`, `15 phút`, `30 phút`.
   - Nhóm 3 — **NHẮC LẠI / BÁO LẠI SAU (`snooze`):**
     - Danh sách pill button: `5 phút`, `10 phút`, `15 phút`, `20 phút`.
   - Nhóm 4 — **GIỜ IM LẶNG (`quietStart` - `quietEnd`):**
     - Hiển thị dải giờ "Không nhắc từ [HH:mm] đến [HH:mm]".
     - Bấm vào nút giờ sẽ mở `TimePickerModal` để tinh chỉnh giờ bắt đầu / kết thúc.
   - Nhóm 5 — **KHÁC:**
     - Ngôn ngữ: "Tiếng Việt", Giao diện: "Sáng".

2. **Hệ thống Thông báo (Toast & Native Notification):**
   - `src/components/common/ToastNotification.tsx`:
     - Banner thông báo xuất hiện ở góc trên bên phải màn hình (vị trí `top: 20px, right: 20px`, bo góc `16px`, animation `toastIn`).
     - Icon chuông/thông báo trên nền xanh `#2563EB`, tiêu đề NLTASK + "bây giờ", tên công việc và giờ nhắc. Tự động đóng sau 3.2s.
   - `src/services/notification-service.ts`:
     - Tích hợp `@tauri-apps/plugin-notification`: Kiểm tra quyền thông báo (`isPermissionGranted()`, `requestPermission()`).
     - Gửi thông báo native khi task đến hạn: kiểm tra điều kiện `settings.push === true` và thời gian hiện tại không nằm trong khoảng giờ im lặng (`quietStart` $\rightarrow$ `quietEnd`).
     - Phát âm thanh chuông thông báo nếu `settings.sound === true`.
     - **Giới hạn phạm vi (đã xác nhận):** Scheduler chạy bằng `setInterval`/`setTimeout` phía client, chỉ hoạt động khi tiến trình Desktop app đang chạy — kể cả khi cửa sổ bị ẩn xuống system tray (Phase 01). Không hoạt động khi người dùng chọn "Thoát" ở tray menu hoặc tắt máy hẳn, vì backend không có delivery engine push thật (chỉ lưu `Settings`, xem `docs/system-architecture.md`).

## Kiểm chứng (Verification)
- Mở tab Cài đặt: Kiểm tra các giá trị switch và pill button load đúng từ backend.
- Bật/tắt các switch hoặc chọn thời gian nhắc nhở: Xác nhận API `PATCH /api/settings` được gửi và lưu thành công vào database MySQL.
- Bấm nút "Xem trước thông báo nhắc nhở" trên modal thêm task: Toast notification xuất hiện chuẩn xác ở góc trên phải.
- Kiểm tra tính năng Native Notification của Tauri khi một task đến thời điểm nhắc nhở.
- Ẩn app xuống tray, xác nhận scheduler vẫn bắn thông báo đúng giờ trong lúc cửa sổ đang ẩn.

<!-- Updated: Validation Session 1 - làm rõ giới hạn scheduler chỉ hoạt động khi process đang chạy (kể cả ẩn trong tray) -->
