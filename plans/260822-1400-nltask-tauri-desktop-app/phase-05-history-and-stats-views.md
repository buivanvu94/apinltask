# Phase 05: History View & Stats View (Lịch sử & Thống kê)

## Mục tiêu
Xây dựng màn hình Lịch sử (History View) với tính năng tìm kiếm theo thời gian thực và gom nhóm theo ngày, cùng màn hình Thống kê (Stats View) trực quan hóa dữ liệu hiệu suất làm việc từ API backend (`GET /api/history` và `GET /api/stats/week`).

## Các bước thực hiện

1. **Màn hình Lịch sử (`src/views/HistoryView.tsx`):**
   - Service: `src/services/history-service.ts` gọi `GET /api/history?search=`.
   - Header: Tiêu đề lớn "Lịch sử" + dòng phụ "Tổng {count} công việc đã hoàn thành".
   - Ô tìm kiếm (`Search Input`): Bo góc `12px`, icon kính lúp, hỗ trợ lọc debounce từ khoá tìm kiếm trực tiếp với API backend.
   - Danh sách công việc hoàn thành được phân nhóm theo mốc thời gian:
     - Nhóm "Hôm nay", "Hôm qua", hoặc "dd ThM" (ví dụ: `20 Th8`).
     - Từng dòng task: Checkbox xanh có dấu tích trắng, chấm màu danh mục, tiêu đề gạch ngang màu xám `#94A3B8`, thời gian "Hoàn thành lúc HH:mm".
     - Hỗ trợ bấm vào checkbox để huỷ hoàn thành (chuyển task quay lại tab Hôm nay qua API toggle).
   - Hiển thị trạng thái rỗng ("Chưa có lịch sử phù hợp") khi không có dữ liệu.

2. **Màn hình Thống kê (`src/views/StatsView.tsx`):**
   - Service: `src/services/stats-service.ts` gọi `GET /api/stats/week`.
   - Header: Tiêu đề lớn "Thống kê" + nhãn "Tuần này".
   - Hàng Thẻ Thống kê Tổng quan (Flex wrap):
     1. **Thẻ Tỉ lệ hoàn thành:** Biểu đồ tròn Donut mini vẽ bằng CSS `conic-gradient(#2563EB X%, #E2E8F0 0)`, hiển thị phần trăm ở giữa + nhãn "Tỉ lệ hoàn thành".
     2. **Thẻ Chuỗi liên tiếp (Streak):** Icon ngọn lửa màu cam `#D97706`, hiển thị số ngày chuỗi (ví dụ `5 ngày`) + nhãn "Chuỗi liên tiếp".
     3. **Thẻ Biểu đồ 7 Ngày trong tuần:** Hiển thị 7 cột đại diện từ Thứ 2 $\rightarrow$ Chủ Nhật (T2, T3, T4, T5, T6, T7, CN). Mỗi cột hiển thị số lượng task đã hoàn thành, thanh bar bo góc có chiều cao co giãn theo tỷ lệ `(10 + count/max * 90)px`. Cột của ngày hôm nay được làm nổi bật với màu xanh `#2563EB`.
   - Khối **Thống kê Theo danh mục:**
     - Card bo góc `18px`, danh sách các danh mục có công việc hoàn thành.
     - Hiển thị tên danh mục, số lượng và thanh Progress bar nằm ngang hiển thị tỷ lệ phần trăm với màu nhận diện đặc trưng của danh mục đó (Công việc: `#2563EB`, Cá nhân: `#7C3AED`, Học tập: `#0D9488`, Sức khỏe: `#E11D48`, Khác: `#64748B`).

## Kiểm chứng (Verification)
- Chuyển sang tab Lịch sử: Xác nhận danh sách hiển thị đúng các task có `completed = true`, gom nhóm ngày chuẩn xác.
- Nhập từ khoá vào ô tìm kiếm: Danh sách lọc ngay lập tức theo từ khoá tương ứng.
- Chuyển sang tab Thống kê: Kiểm tra Donut chart, số ngày Streak, 7 cột ngày trong tuần và thanh danh mục hiển thị dữ liệu khớp hoàn toàn với kết quả trả về từ API backend `GET /api/stats/week`.
