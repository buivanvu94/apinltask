# Phase 03: Layout Shell & Today View (Tab Hôm nay)

## Mục tiêu
Xây dựng khung giao diện chính (Sidebar điều hướng 4 tab) và màn hình trung tâm "Hôm nay" (Today View) kết hợp Panel chi tiết công việc (Task Detail Panel) theo chuẩn thiết kế `UIDEMO/NLTASK Desktop.dc.html`, kết nối API lấy dữ liệu và toggle trạng thái hoàn thành công việc.

## Các bước thực hiện

1. **Sidebar Navigation (`src/components/sidebar/Sidebar.tsx`):**
   - Background gradient `linear-gradient(180deg, #152A63 0%, #0B1220 100%)`, độ rộng cố định `248px`.
   - Header: Logo NLTASK + Typography Space Grotesk.
   - Nút "+ Thêm công việc" (background trắng, chữ xanh đậm `#152A63`).
   - 4 Nút tab điều hướng với SVG icon và trạng thái active: Hôm nay (`today`), Lịch sử (`history`), Thống kê (`stats`), Cài đặt (`settings`).
   - Footer: Thông tin User đăng nhập, nút Đăng xuất (Logout) và nhãn phiên bản `NLTASK · v1.0.0`.

2. **Task API Service & Custom Hooks:**
   - `src/services/task-service.ts`:
     - `getTasks(params)`: `GET /api/tasks?category=&from=&to=`
     - `getTaskSummary()`: `GET /api/tasks/summary`
     - `toggleTask(id)`: `PATCH /api/tasks/:id/toggle`
     - `deleteTask(id)`: `DELETE /api/tasks/:id`
   - `src/utils/date-format-utils.ts`: Các hàm format `fmtTime`, `fmtDateShort`, `fmtDateFull`, `humanize(ms)`, `isSameDay`, `WEEKDAY_FULL`.
   - `src/hooks/useTasks.ts`: Hook quản lý fetching dữ liệu tasks, tự động cập nhật đồng hồ `now` mỗi 30s để tính toán thời gian quá hạn/sắp tới theo thời gian thực.

3. **Màn hình Hôm nay (`src/views/TodayView.tsx`):**
   - Header ngày tháng: Tên thứ (`weekdayLabel`) và ngày tháng đầy đủ (`dateLabel`).
   - 3 Card thống kê nhanh (Quick Stat Cards):
     1. **Tiến độ hôm nay:** Donut mini conic gradient, tỷ lệ % và `completed/total`.
     2. **Quá hạn:** Icon cảnh báo đỏ, số lượng task quá hạn.
     3. **Sắp tới:** Icon lịch xanh dương, số lượng task trong tương lai.
   - **Filter Chips Bar:** Danh sách pill buttons (Tất cả, Công việc, Cá nhân, Học tập, Sức khỏe, Khác) để lọc danh sách hiển thị.
   - **Danh sách công việc:**
     - Nhóm **Quá hạn** (viền đỏ nhạt `#FECACA`, nhãn đếm lùi quá hạn màu đỏ `#DC2626`).
     - Nhóm **Hôm nay** (checkbox tròn toggle API, gạch ngang tiêu đề khi hoàn thành, hiển thị nhãn đếm ngược giờ).
     - Nhóm **Sắp tới** (ngày ngắn + giờ).
   - Click vào từng dòng task sẽ chọn task đó và hiển thị trên Detail Panel.

4. **Panel Chi tiết Công việc (`src/components/task/TaskDetailPanel.tsx`):**
   - Vị trí: Sidebar bên phải màn hình Today (chiều rộng `360px`, nền trắng, border trái `#EEF1F5`).
   - Khi chưa chọn task: Hiển thị icon placeholder + "Chọn một công việc để xem chi tiết".
   - Khi đã chọn task:
     - Nút Sửa (bút chì) và Nút Đóng ($X$).
     - Checkbox tròn to + Tiêu đề công việc.
     - Tag phân loại danh mục và mức độ ưu tiên.
     - Khối mô tả chi tiết (nếu có).
     - Hộp thông tin bổ sung: Ngày giờ, Địa điểm (icon pin map), Tần suất lặp lại.
     - Badge trạng thái: "Đã hoàn thành lúc HH:mm" hoặc banner đếm ngược "Còn X ngày/giờ nữa" / "Quá hạn X ngày".
     - Nút viền đỏ "Xoá công việc" ở cuối panel.

## Kiểm chứng (Verification)
- Mở tab Hôm nay: Kiểm tra hiển thị đúng dữ liệu từ backend API `/api/tasks` và `/api/tasks/summary`.
- Click checkbox của 1 task: Kiểm tra API `/api/tasks/:id/toggle` được gọi, trạng thái hoàn thành đổi ngay lập tức, tiến độ % trên card tự động cập nhật.
- Click chọn task: Panel bên phải mở chi tiết chuẩn xác theo dữ liệu task đó.
- Lọc theo từng Category: Danh sách hiển thị đúng các task thuộc category tương ứng.
