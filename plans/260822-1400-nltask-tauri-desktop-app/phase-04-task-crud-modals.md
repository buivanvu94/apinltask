# Phase 04: Task Form Modals & Custom Pickers (CRUD Hoàn chỉnh)

## Mục tiêu
Xây dựng đầy đủ các modal tương tác thêm mới, chỉnh sửa và xoá công việc cùng bộ chọn Ngày / Giờ tuỳ biến (Custom DatePicker & TimePicker) theo thiết kế `NLTASK Desktop.dc.html`, kết nối API tạo mới (`POST /api/tasks`), cập nhật (`PATCH /api/tasks/:id`) và xoá (`DELETE /api/tasks/:id`).

## Các bước thực hiện

1. **Modal Thêm / Sửa Công việc (`src/components/task/TaskAddEditModal.tsx`):**
   - Modal rộng `560px`, bo góc `22px`, animation `modalPop`.
   - Header: Tiêu đề "Thêm công việc" hoặc "Sửa công việc" + nút $X$.
   - Body Form:
     - Ô nhập **Tiêu đề** (font `20px Space Grotesk`, gạch chân đỏ khi validate lỗi).
     - Ô nhập **Mô tả** (textarea bo góc `14px`).
     - Hàng nút chọn **Ngày** và **Giờ** (mở popup chọn ngày/giờ riêng biệt).
     - Banner thông báo nhắc nhở: *"Sẽ nhắc bạn vào [Thứ..., ngày... lúc HH:mm]"*.
     - Chọn **Mức độ ưu tiên** (Pills: Thấp `#16A34A`, Trung bình `#D97706`, Cao `#DC2626`).
     - Chọn **Danh mục** (Pills: Công việc, Cá nhân, Học tập, Sức khỏe, Khác).
     - Chọn **Tần suất lặp lại** (Pills: Không lặp lại, Hàng ngày, Hàng tuần).
     - Ô nhập **Địa điểm** kèm icon bản đồ.
     - Nút *"Xem trước thông báo nhắc nhở"* (trigger Toast mô phỏng).
   - Footer: Nút **Hủy** và Nút **Lưu công việc** (gửi API).

2. **Custom DatePicker Modal (`src/components/pickers/DatePickerModal.tsx`):**
   - Popup kích thước `320px`, căn giữa màn hình.
   - Header tháng/năm kèm nút chuyển tháng trước/sau (giới hạn không lùi quá tháng hiện tại).
   - Lưới 7 cột (T2 $\rightarrow$ CN) gồm 42 ô ngày.
   - Trạng thái các ô: Ngày ngoài tháng (màu xám nhạt `#E2E8F0`), Ngày quá khứ (vô hiệu hóa `#CBD5E1`), Ngày hôm nay (chữ xanh `#2563EB`), Ngày được chọn (nền xanh `#2563EB`, chữ trắng).

3. **Custom TimePicker Modal (`src/components/pickers/TimePickerModal.tsx`):**
   - Popup kích thước `300px`.
   - 2 Cột Stepper cho Giờ và Phút với số hiển thị `34px Space Grotesk`, nút `+` và `–` (bước nhảy 5 phút).
   - Các nút chọn giờ nhanh (Quick times): `08:00`, `12:00`, `18:00`, `20:00`, `21:00`.
   - Tái sử dụng component này cho cấu hình giờ im lặng trong Cài đặt (`quietStart`, `quietEnd`).

4. **Modal Xác nhận Xoá (`src/components/task/TaskDeleteModal.tsx`):**
   - Popup `280px`, cảnh báo *"Xoá công việc này? Hành động này không thể hoàn tác."*
   - Nút Hủy và Nút Xoá đỏ `#DC2626`.
   - Gọi API `DELETE /api/tasks/:id`, đóng panel chi tiết và làm mới danh sách task.

## Kiểm chứng (Verification)
- Mở modal Thêm công việc từ nút trên Sidebar: Thử tạo 1 task mới với đầy đủ ngày giờ, ưu tiên cao, danh mục "Công việc". Bấm Lưu và kiểm tra task xuất hiện ngay trên danh sách và được ghi vào MySQL.
- Bấm nút Sửa từ Detail Panel: Form load đúng dữ liệu cũ, chỉnh sửa tiêu đề/ngày giờ, bấm Lưu và xác nhận thay đổi đã được cập nhật qua API `PATCH /api/tasks/:id`.
- Bấm nút Xoá và xác nhận trên Modal: Task bị xoá khỏi danh sách và API `DELETE /api/tasks/:id` trả về thành công.
- Thử bấm Lưu khi chưa nhập tiêu đề hoặc chưa chọn ngày giờ: Modal hiển thị cảnh báo đỏ và ngăn gửi request không hợp lệ.
