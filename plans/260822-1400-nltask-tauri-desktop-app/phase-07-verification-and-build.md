# Phase 07: End-to-End Verification & Desktop Release Build

## Mục tiêu
Thực hiện kiểm thử tích hợp toàn diện (E2E) giữa ứng dụng Desktop Tauri và backend API, rà soát tính tuân thủ quy chuẩn modularity code (< 200 dòng/file), và đóng gói bản phát hành Desktop (`.exe` / `.msi`).

## Các bước thực hiện

1. **Kịch bản Kiểm thử Tích hợp (E2E Integration Checklist):**
   - **Xác thực (Auth):**
     - Đăng nhập tài khoản admin và tài khoản user thông thường.
     - Kiểm tra phiên làm việc được lưu giữ sau khi khởi động lại app.
     - Giả lập hết hạn token (sửa thời gian hoặc xóa access token) $\rightarrow$ kiểm tra interceptor tự refresh không làm gián đoạn người dùng.
   - **Quản lý Công việc (Tasks CRUD):**
     - Tạo mới 3 task với các độ ưu tiên (Thấp, Vừa, Cao), danh mục khác nhau, ngày giờ hôm nay / tương lai.
     - Đổi trạng thái hoàn thành trên tab Hôm nay $\rightarrow$ kiểm tra card tiến độ % cập nhật ngay lập tức.
     - Chọn 1 task $\rightarrow$ mở Detail Panel $\rightarrow$ bấm Sửa $\rightarrow$ cập nhật mô tả $\rightarrow$ lưu thành công.
     - Xoá 1 task $\rightarrow$ xác nhận modal và kiểm tra task biến mất khỏi danh sách.
   - **Lịch sử (History):**
     - Xem danh sách task đã hoàn thành $\rightarrow$ thử tìm kiếm theo từ khoá.
     - Bấm bỏ tích 1 task trong lịch sử $\rightarrow$ xác nhận task chuyển ngược về tab Hôm nay.
   - **Thống kê (Stats):**
     - So sánh số liệu trên biểu đồ tuần, số ngày streak và danh mục với dữ liệu thực trong database.
   - **Cài đặt & Thông báo (Settings & Notifications):**
     - Đổi cấu hình nhắc nhở và giờ im lặng $\rightarrow$ reload app kiểm tra giá trị được lưu.
     - Test bắn thông báo desktop.
   - **System Tray:**
     - Bấm nút X đóng cửa sổ $\rightarrow$ xác nhận app ẩn xuống tray, process vẫn chạy, scheduler vẫn bắn thông báo đúng giờ.
     - Bấm "Mở NLTASK" từ tray $\rightarrow$ cửa sổ hiện lại đúng trạng thái trước đó.
     - Bấm "Thoát" từ tray menu $\rightarrow$ process kết thúc hẳn.

2. **Rà soát Modularity Codebase:**
   - Quét toàn bộ các file trong thư mục `desktop/src/` để đảm bảo không file nào vượt quá 200 dòng code.
   - Tách nhỏ các logic hook/service phức tạp nếu cần thiết.

3. **Đóng gói Sản phẩm (Tauri Build):**
   - **Phạm vi (đã xác nhận):** Chỉ build target Windows (`.msi` / `.exe`), không build macOS/Linux.
   - Chạy `npm run build` để kiểm tra compile TypeScript và Vite bundle.
   - Chạy `npm run tauri build` để biên dịch Rust binary và đóng gói file cài đặt Windows (`.msi` / `.exe`).
   - Kiểm tra chạy thử file build độc lập.

<!-- Updated: Validation Session 1 - build scope Windows-only, thêm kịch bản test system tray -->

## Báo cáo Nghiệm thu (Deliverables)
- Bộ mã nguồn Desktop hoàn chỉnh tại `desktop/`.
- File thực thi desktop chạy mượt mà, kết nối thông suốt với backend.
- Tạo báo cáo nghiệm thu tại `plans/260822-1400-nltask-tauri-desktop-app/reports/verification-report.md`.
