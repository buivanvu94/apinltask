# Phase 02: Data Layer, API Client & Auth Module

## Mục tiêu
Định nghĩa hệ thống kiểu dữ liệu TypeScript, xây dựng HTTP API Client (Axios) xử lý xác thực JWT + tự động Refresh Token khi hết hạn, và thiết kế màn hình Đăng nhập (Auth View) đồng bộ giao diện NLTASK.

## Các bước thực hiện

1. **TypeScript Types & Constants:**
   - `src/types/auth.ts`: `User`, `LoginCredentials`, `AuthResponse`, `AuthState`.
   - `src/types/task.ts`: `Task`, `TaskCategory`, `TaskPriority`, `TaskRepeat`, `TaskSummary`, `TaskInput`.
   - `src/types/stats.ts`: `WeekStats`, `DayBarData`, `CategoryStat`.
   - `src/types/settings.ts`: `UserSettings`, `UpdateSettingsInput`.
   - `src/constants/categories.ts`: `CATEGORIES` (`work`, `personal`, `study`, `health`, `other` kèm màu sắc, nhãn tiếng Việt).
   - `src/constants/priorities.ts`: `PRIORITIES` (`low`, `medium`, `high` kèm màu sắc, nhãn tiếng Việt).
   - `src/constants/repeats.ts`: `REPEATS` (`none`, `daily`, `weekly`).

2. **Storage & API Client Layer:**
   - `src/services/token-storage.ts`: Quản lý lưu trữ `accessToken` in-memory (không persist), `refreshToken` lưu qua `@tauri-apps/plugin-store` (file store trong app-data, an toàn hơn localStorage vì không bị đọc bởi script injection trong webview).
   - `src/services/api-client.ts`: Khởi tạo Axios instance (BaseURL: `http://localhost:4000/api` hoặc qua `VITE_API_BASE_URL`).
     - Request Interceptor: Tự động đính kèm header `Authorization: Bearer <accessToken>`.
     - Response Interceptor: Bắt lỗi `401 Unauthorized` $\rightarrow$ kiểm tra và gọi `POST /api/auth/refresh` với `refreshToken` $\rightarrow$ cập nhật token mới và tự động gửi lại request bị lỗi. Nếu refresh thất bại, xóa token và trigger đăng xuất.
     - **Dedupe refresh:** Dùng 1 biến `refreshPromise` dùng chung ở module scope — khi nhiều request đồng thời gặp 401, chỉ request đầu tiên gọi `POST /api/auth/refresh`, các request 401 khác `await` cùng `refreshPromise` thay vì tự gọi refresh riêng lẻ (tránh race condition/token bị revoke liên tục).
   - `src/services/auth-service.ts`: Các hàm gọi API `login()`, `logout()`, `refresh()`, `getMe()`.

3. **Auth Context & Hook (`src/contexts/AuthContext.tsx`):**
   - Quản lý trạng thái `user`, `isAuthenticated`, `isLoading`.
   - Hàm `login(email, password)` và `logout()`.
   - Tự động gọi `getMe()` lúc khởi động app để khôi phục phiên đăng nhập từ `refreshToken`.

4. **Màn hình Đăng nhập (`src/views/AuthView.tsx`):**
   - Giao diện Card hiện đại với logo NLTASK (Gradient `#3B7CF6` $\rightarrow$ `#152A63`), trường nhập Email và Password có kiểm tra tính hợp lệ.
   - Hiển thị thông báo lỗi thân thiện nếu sai mật khẩu hoặc mất kết nối backend.
   - Trạng thái loading mượt mà khi đang xác thực.

## Kiểm chứng (Verification)
- Khởi động backend Express ở `localhost:4000`.
- Mở Desktop app: nếu chưa có token, app hiển thị `AuthView`.
- Nhập tài khoản admin mặc định (`admin@nltask.local` / mật khẩu cấu hình trong `.env`), bấm Đăng nhập.
- Xác nhận nhận về token thành công, lưu trữ đúng và chuyển tiếp sang màn hình chính.
- Kiểm tra tính năng refresh token: giả lập token hết hạn, request kế tiếp vẫn tự động làm mới và thành công.
- Kiểm tra dedupe: bắn nhiều request song song khi access token hết hạn, xác nhận `POST /api/auth/refresh` chỉ được gọi 1 lần duy nhất.

<!-- Updated: Validation Session 1 - refreshToken lưu qua plugin-store thay vì localStorage, thêm cơ chế dedupe refresh -->
