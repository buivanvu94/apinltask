# NLTASK - REST API Documentation (Mobile App)

Tài liệu API chuẩn RESTful cho ứng dụng NLTASK Mobile.

---

## 📌 Thông tin chung (General Information)

- **Base URL:** (`https://apinltask.nguyenluan.vn`)
- **Headers chung:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <accessToken>` (Bắt buộc với các endpoint có ổ khóa 🔒)
- **Timezone & Định dạng ngày giờ:**
  - Mọi ngày giờ gửi lên / trả về đều là **ISO-8601 UTC string** (Ví dụ: `2026-08-22T08:30:00.000Z`).
  - Giờ yên tĩnh (Quiet hours) có dạng `HH:mm` (Ví dụ: `"22:00"`).
- **Cấu trúc lỗi chung (Error Format):**
  ```json
  {
    "error": "Message lỗi",
    "details": [] // Chỉ có khi lỗi validation (400)
  }
  ```

---

## 🏷️ Danh mục Enums (Data Constants)

| Enum | Giá trị hợp lệ | Ghi chú |
|---|---|---|
| **Category** | `"work"`, `"personal"`, `"study"`, `"health"`, `"other"` | Danh mục task |
| **Priority** | `"low"`, `"medium"`, `"high"` | Mức độ ưu tiên |
| **Repeat** | `"none"`, `"daily"`, `"weekly"` | Chu kỳ lặp lại |
| **Role** | `"ADMIN"`, `"USER"` | Quyền tài khoản |
| **RemindBefore** | `0`, `5`, `15`, `30` (phút) | Báo trước giờ hạn |
| **Snooze** | `5`, `10`, `15`, `20` (phút) | Thời gian hoãn báo |

---

## 1. System

### `GET /health`
Kiểm tra trạng thái server.

- **Auth:** Public
- **Response 200 OK:**
  ```json
  {
    "status": "ok"
  }
  ```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/login`
Đăng nhập bằng email và mật khẩu.

- **Auth:** Public
- **Body:**
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `email` | string | ✅ | Email đăng nhập hợp lệ |
  | `password` | string | ✅ | Mật khẩu |
- **Request Example:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "48-byte-hex-token",
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "name": "Nguyen Van A",
      "role": "USER"
    }
  }
  ```
- **Response 401 Unauthorized:**
  ```json
  {
    "error": "Email hoặc mật khẩu không đúng"
  }
  ```

---

### `POST /api/auth/refresh`
Cấp mới Access Token bằng Refresh Token (Token Rotation).

- **Auth:** Public
- **Body:**
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `refreshToken` | string | ✅ | Refresh token nhận được khi login/refresh |
- **Request Example:**
  ```json
  {
    "refreshToken": "48-byte-hex-token"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "new-48-byte-hex-token"
  }
  ```
- **Response 401 Unauthorized:**
  ```json
  {
    "error": "Invalid refresh token"
  }
  ```

---

### `POST /api/auth/logout`
Đăng xuất và hủy Refresh Token.

- **Auth:** Public
- **Body:**
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `refreshToken` | string | ✅ | Refresh token cần hủy |
- **Request Example:**
  ```json
  {
    "refreshToken": "48-byte-hex-token"
  }
  ```
- **Response 204 No Content:** Thành công (không có body).

---

### `GET /api/auth/me` 🔒
Lấy thông tin tài khoản đang đăng nhập từ Access Token.

- **Auth:** `Bearer <accessToken>`
- **Response 200 OK:**
  ```json
  {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "USER"
  }
  ```
- **Response 401 Unauthorized:** Token hết hạn hoặc không hợp lệ.

---

## 3. Tasks (`/api/tasks`)

> Tất cả task đều tự động lọc theo user hiện tại (`req.user.id`).

### `GET /api/tasks` 🔒
Lấy danh sách công việc theo bộ lọc.

- **Auth:** `Bearer <accessToken>`
- **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  |---|---|---|---|---|
  | `scope` | string | ❌ | `"all"` | Bộ lọc phạm vi: `"all"`, `"today"`, `"overdue"`, `"upcoming"` |
  | `category` | string | ❌ | - | Lọc theo danh mục: `"work"`, `"personal"`, `"study"`, `"health"`, `"other"` |
- **Response 200 OK:**
  ```json
  [
    {
      "id": "cm01task01...",
      "title": "Họp dự án Mobile",
      "desc": "Thảo luận kiến trúc Flutter/React Native",
      "category": "work",
      "priority": "high",
      "repeat": "none",
      "location": "Phòng họp 2",
      "dueAt": "2026-08-22T10:00:00.000Z",
      "completed": false,
      "completedAt": null,
      "createdAt": "2026-08-22T01:00:00.000Z",
      "updatedAt": "2026-08-22T01:00:00.000Z"
    }
  ]
  ```

---

### `GET /api/tasks/summary` 🔒
Lấy số liệu tóm tắt công việc cho dashboard / header.

- **Auth:** `Bearer <accessToken>`
- **Response 200 OK:**
  ```json
  {
    "todayTotalCount": 5,
    "todayCompletedCount": 2,
    "overdueCount": 1,
    "upcomingCount": 8
  }
  ```

---

### `GET /api/tasks/:id` 🔒
Lấy chi tiết một task theo ID.

- **Auth:** `Bearer <accessToken>`
- **Path Parameters:**
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `id` | string | ✅ | CUID của task |
- **Response 200 OK:** (Trả về 1 đối tượng Task như trong `GET /api/tasks`)
- **Response 404 Not Found:**
  ```json
  {
    "error": "Task not found"
  }
  ```

---

### `POST /api/tasks` 🔒
Tạo mới một công việc.

- **Auth:** `Bearer <accessToken>`
- **Body:**
  | Field | Type | Required | Default | Description |
  |---|---|---|---|---|
  | `title` | string | ✅ | - | Tiêu đề task (min: 1 ký tự) |
  | `desc` | string | ❌ | `null` | Mô tả chi tiết |
  | `category` | string | ❌ | `"other"` | `"work"`, `"personal"`, `"study"`, `"health"`, `"other"` |
  | `priority` | string | ❌ | `"medium"` | `"low"`, `"medium"`, `"high"` |
  | `repeat` | string | ❌ | `"none"` | `"none"`, `"daily"`, `"weekly"` |
  | `location` | string | ❌ | `null` | Địa điểm / vị trí |
  | `dueAt` | string | ✅ | - | Thời hạn (Định dạng ISO-8601 string) |
- **Request Example:**
  ```json
  {
    "title": "Mua tài liệu học",
    "desc": "Sách React Native & TypeScript",
    "category": "study",
    "priority": "medium",
    "repeat": "none",
    "location": "Nhà sách Fahasa",
    "dueAt": "2026-08-22T17:00:00.000Z"
  }
  ```
- **Response 201 Created:** (Trả về đối tượng Task vừa tạo)

---

### `PATCH /api/tasks/:id` 🔒
Cập nhật thông tin công việc.

- **Auth:** `Bearer <accessToken>`
- **Path Parameters:** `id` (string, required)
- **Body:** (Tất cả các trường đều là optional)
  | Field | Type | Description |
  |---|---|---|
  | `title` | string | Tiêu đề mới |
  | `desc` | string | Mô tả mới |
  | `category` | string | Danh mục mới |
  | `priority` | string | Mức ưu tiên mới |
  | `repeat` | string | Chu kỳ lặp lại mới |
  | `location` | string | Địa điểm mới |
  | `dueAt` | string | Thời hạn mới (ISO-8601 string) |
- **Request Example:**
  ```json
  {
    "priority": "high",
    "dueAt": "2026-08-22T18:00:00.000Z"
  }
  ```
- **Response 200 OK:** (Trả về đối tượng Task sau khi cập nhật)
- **Response 404 Not Found:** Task không tồn tại hoặc không thuộc user.

---

### `PATCH /api/tasks/:id/toggle` 🔒
Đảo ngược trạng thái hoàn thành của task (Done ↔ Undone).

- **Auth:** `Bearer <accessToken>`
- **Path Parameters:** `id` (string, required)
- **Body:** Rỗng
- **Response 200 OK:**
  ```json
  {
    "id": "cm01task01...",
    "title": "Mua tài liệu học",
    "desc": "Sách React Native & TypeScript",
    "category": "study",
    "priority": "medium",
    "repeat": "none",
    "location": "Nhà sách Fahasa",
    "dueAt": "2026-08-22T17:00:00.000Z",
    "completed": true,
    "completedAt": "2026-08-22T08:15:30.123Z",
    "createdAt": "2026-08-22T01:00:00.000Z",
    "updatedAt": "2026-08-22T08:15:30.123Z"
  }
  ```

---

### `DELETE /api/tasks/:id` 🔒
Xóa một công việc.

- **Auth:** `Bearer <accessToken>`
- **Path Parameters:** `id` (string, required)
- **Response 204 No Content:** Xóa thành công.
- **Response 404 Not Found:** Task không tồn tại.

---

## 4. History (`/api/history`)

### `GET /api/history` 🔒
Lấy danh sách các task đã hoàn thành (`completed: true`), sắp xếp theo thời gian hoàn thành gần nhất.

- **Auth:** `Bearer <accessToken>`
- **Query Parameters:**
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `search` | string | ❌ | Tìm kiếm theo tiêu đề task |
- **Response 200 OK:**
  ```json
  {
    "totalCount": 12,
    "items": [
      {
        "id": "cm01task01...",
        "title": "Hoàn thành mockup UI",
        "category": "work",
        "completedAt": "2026-08-22T08:15:30.123Z",
        "dateKey": "2026-08-22"
      }
    ]
  }
  ```

---

## 5. Statistics (`/api/stats`)

### `GET /api/stats/week` 🔒
Lấy số liệu thống kê hiệu suất trong tuần và chuỗi ngày hoàn thành task (Streak).

- **Auth:** `Bearer <accessToken>`
- **Response 200 OK:**
  ```json
  {
    "completionRateWeek": 85,
    "streakDays": 4,
    "weekBars": [
      { "weekdayIndex": 0, "dateKey": "2026-08-17", "count": 3 },
      { "weekdayIndex": 1, "dateKey": "2026-08-18", "count": 5 },
      { "weekdayIndex": 2, "dateKey": "2026-08-19", "count": 2 },
      { "weekdayIndex": 3, "dateKey": "2026-08-20", "count": 6 },
      { "weekdayIndex": 4, "dateKey": "2026-08-21", "count": 4 },
      { "weekdayIndex": 5, "dateKey": "2026-08-22", "count": 1 },
      { "weekdayIndex": 6, "dateKey": "2026-08-23", "count": 0 }
    ],
    "categoryBreakdown": [
      { "category": "work", "count": 10, "pct": 48 },
      { "category": "study", "count": 6, "pct": 29 },
      { "category": "health", "count": 3, "pct": 14 },
      { "category": "personal", "count": 2, "pct": 9 }
    ]
  }
  ```
- **Ý nghĩa các trường:**
  - `completionRateWeek`: Tỷ lệ % hoàn thành task trong tuần hiện tại (0 - 100).
  - `streakDays`: Số ngày liên tiếp có ít nhất 1 task hoàn thành.
  - `weekBars`: Dữ liệu cột 7 ngày trong tuần (`weekdayIndex`: 0 = Thứ 2, ..., 6 = Chủ Nhật; `count`: số task hoàn thành).
  - `categoryBreakdown`: Thống kê tỷ lệ và số lượng task theo từng danh mục.

---

## 6. Settings (`/api/settings`)

### `GET /api/settings` 🔒
Lấy cấu hình thông báo & ứng dụng của user hiện tại (Tự động khởi tạo mặc định nếu chưa có).

- **Auth:** `Bearer <accessToken>`
- **Response 200 OK:**
  ```json
  {
    "id": "cm01sett01...",
    "userId": "cm01user01...",
    "push": true,
    "sound": true,
    "vibrate": true,
    "remindBefore": 15,
    "snooze": 10,
    "quietStart": "22:00",
    "quietEnd": "07:00"
  }
  ```

---

### `PATCH /api/settings` 🔒
Cập nhật cấu hình thông báo & ứng dụng.

- **Auth:** `Bearer <accessToken>`
- **Body:** (Tất cả các trường đều là optional)
  | Field | Type | Allowed Values | Description |
  |---|---|---|---|
  | `push` | boolean | `true`, `false` | Bật/tắt thông báo đẩy |
  | `sound` | boolean | `true`, `false` | Bật/tắt âm thanh |
  | `vibrate` | boolean | `true`, `false` | Bật/tắt rung |
  | `remindBefore` | number | `0`, `5`, `15`, `30` | Nhắc trước (phút) |
  | `snooze` | number | `5`, `10`, `15`, `20` | Báo lại sau (phút) |
  | `quietStart` | string | `"HH:mm"` (Regex: `^([01]\d\|2[0-3]):[0-5]\d$`) | Bắt đầu giờ yên tĩnh |
  | `quietEnd` | string | `"HH:mm"` (Regex: `^([01]\d\|2[0-3]):[0-5]\d$`) | Kết thúc giờ yên tĩnh |
- **Request Example:**
  ```json
  {
    "remindBefore": 30,
    "sound": false,
    "quietStart": "23:00"
  }
  ```
- **Response 200 OK:** (Trả về đối tượng Settings sau cập nhật)

---

## 7. User Management (`/api/users`) - [ADMIN ONLY] 🛡️

> Yêu cầu Token có quyền `role: "ADMIN"`. Nếu user bình thường gọi sẽ nhận `403 Forbidden`.

### `GET /api/users` 🔒🛡️
Lấy danh sách tất cả tài khoản.

- **Response 200 OK:**
  ```json
  [
    {
      "id": "cm01user01...",
      "email": "admin@nltask.local",
      "name": "Administrator",
      "role": "ADMIN",
      "createdAt": "2026-08-22T00:00:00.000Z"
    },
    {
      "id": "cm01user02...",
      "email": "member@nltask.local",
      "name": "Member User",
      "role": "USER",
      "createdAt": "2026-08-22T01:00:00.000Z"
    }
  ]
  ```

---

### `POST /api/users` 🔒🛡️
Tạo tài khoản người dùng mới.

- **Body:**
  | Field | Type | Required | Default | Description |
  |---|---|---|---|---|
  | `email` | string | ✅ | - | Email hợp lệ (unique) |
  | `name` | string | ✅ | - | Tên hiển thị (min: 1) |
  | `password` | string | ✅ | - | Mật khẩu (min: 8 ký tự) |
  | `role` | string | ❌ | `"USER"` | `"ADMIN"` hoặc `"USER"` |
- **Response 201 Created:** (Trả về User vừa tạo, không kèm password)
- **Response 409 Conflict:** Email đã tồn tại.

---

### `PATCH /api/users/:id` 🔒🛡️
Cập nhật thông tin user.

- **Body:**
  | Field | Type | Description |
  |---|---|---|
  | `name` | string | Tên hiển thị mới |
  | `role` | string | `"ADMIN"` hoặc `"USER"` (Không thể hạ role của Admin cuối cùng) |
- **Response 200 OK:** (Trả về User sau cập nhật)
- **Response 400 Bad Request:** Nếu cố hạ quyền Admin cuối cùng trong hệ thống.

---

### `POST /api/users/:id/reset-password` 🔒🛡️
Admin đặt lại mật khẩu cho user (Tự động revoke toàn bộ session/token của user đó).

- **Body:**
  | Field | Type | Required | Description |
  |---|---|---|---|
  | `newPassword` | string | ✅ | Mật khẩu mới (min: 8 ký tự) |
- **Response 204 No Content:** Đổi mật khẩu thành công.

---

### `DELETE /api/users/:id` 🔒🛡️
Xóa tài khoản người dùng (Xóa cascade toàn bộ Tasks, Settings, Refresh Tokens liên quan).

- **Response 204 No Content:** Xóa thành công.
- **Response 400 Bad Request:** Không được xóa Admin cuối cùng.
