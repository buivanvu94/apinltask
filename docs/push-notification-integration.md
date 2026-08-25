# Push Notification — Tài liệu cho BE

Mobile (Expo/React Native) đã làm xong phần đăng ký device token. BE cần: lưu token đúng chỗ, và
chạy cron bắn thông báo khi task tới hạn. Tài liệu này mô tả contract + code mẫu để BE tích hợp.

## 1. Luồng hoạt động

```
Mobile app (đăng nhập) 
  -> xin quyền notification + lấy Expo push token
  -> PATCH /api/auth/me { deviceToken: "ExponentPushToken[...]" }
  -> BE lưu deviceToken vào User

BE (cron, mỗi phút)
  -> quét task tới hạn theo remindBefore của từng user
  -> gọi Expo Push API (https://exp.host/--/api/v2/push/send)
  -> Expo forward tới Apple (APNs) / Google (FCM)
  -> điện thoại nhận thông báo
```

Token là **Expo push token** (dạng `ExponentPushToken[...]`), không phải raw FCM/APNs token. BE
**không** gọi thẳng APNs/FCM — luôn gửi qua Expo Push API (hoặc SDK `expo-server-sdk`), Expo lo phần
forward tới Apple/Google.

## 2. Endpoint mobile đang gọi (đã có, không cần đổi)

```
PATCH /api/auth/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "deviceToken": "ExponentPushToken[xxx]" }   // hoặc null để xoá khi logout
```

- Self-service: user nào cũng gọi được cho chính mình, **không** yêu cầu role ADMIN (khác với
  `/api/users/:id` — endpoint đó vẫn giữ ADMIN-only, không dùng cho việc này).
- Response trả về `User` đầy đủ, gồm `deviceToken` mới lưu.
- Mobile tự gọi lại mỗi lần mở app nếu token đổi, và PATCH `deviceToken: null` lúc đăng xuất.

## 3. Yêu cầu schema

- `User.deviceToken`: string, nullable.
- `Task` cần thêm cột **`remindedAt`** (DateTime, nullable) nếu chưa có — dùng để đánh dấu task đã
  bắn nhắc rồi, tránh cron gửi trùng nhiều lần trong lúc task còn nằm trong khung `remindBefore`.
  Reset lại `remindedAt = null` khi user sửa `dueAt` của task (coi như task "mới", cần nhắc lại).

## 4. Logic cron (viết bằng ORM/DB nào cũng được — đây là pseudocode, không phải code chạy được)

Chưa biết BE dùng ORM/DB gì nên không đưa code cụ thể, chỉ mô tả logic để BE tự implement đúng stack:

```
mỗi phút:
  for user in Users where deviceToken != null and settings.push == true:
    remindBeforeMs = user.settings.remindBefore * 60_000
    tasks = Tasks where userId == user.id
                  and completed == false
                  and remindedAt == null
                  and dueAt <= now + remindBeforeMs

    if tasks rỗng: tiếp user kế

    messages = tasks.map(task => buildMessage(user, task))   // xem mục 5
    gửi messages qua Expo Push API (nên dùng expo-server-sdk để tự chunk +
      check receipt, thay vì tự gọi raw HTTP)

    set remindedAt = now cho các task vừa gửi   // BẮT BUỘC, tránh gửi trùng
      mỗi lần cron chạy trong lúc task còn nằm trong khung remindBefore

    // Expo trả ticket ngay, chưa chắc điện thoại nhận được — sau đó check
    // receipt: nếu lỗi "DeviceNotRegistered" (app bị gỡ/token chết) thì xoá
    // deviceToken của user đó để lần sau khỏi gửi vô ích.
```

Cài thư viện gợi ý (Node.js): `npm install expo-server-sdk node-cron` — `expo-server-sdk` tự lo phần
chunk request + đọc receipt, đỡ phải tự viết lại phần đó bằng raw HTTP.

Yêu cầu bắt buộc phía data: mỗi task cần biết đã "nhắc" chưa (xem mục 3, cột `remindedAt`) — nếu
không có cơ chế đánh dấu tương đương, cron sẽ gửi trùng thông báo liên tục.

## 5. Payload chuẩn (đã thống nhất với app để hiện đúng nội dung + sau này deep-link)

```js
{
  to: user.deviceToken,
  sound: 'default',
  title: 'Nhắc việc',              // hoặc 'Trễ hạn' / 'Cập nhật công việc'
  body: `Sắp đến giờ: ${task.title}`,
  data: { type: 'task_reminder', taskId: task.id },
}
```

`data.type` app đang biết 3 giá trị (xem `scripts/send-test-notification.js` để test từng loại):

| type | Khi nào bắn | title gợi ý |
|---|---|---|
| `task_reminder` | Task sắp tới `dueAt` (trong khung `remindBefore`) | "Nhắc việc" |
| `task_overdue` | Task quá `dueAt` mà chưa `completed` | "Trễ hạn" |
| `task_updated` | Task bị sửa (title/dueAt/category...) | "Cập nhật công việc" |

`data.taskId` luôn gửi kèm — app chưa xử lý deep-link (bấm vào thông báo mở thẳng task), nhưng field
đã có sẵn để làm sau, không cần đổi payload lúc đó.

## 6. Credentials APNs (đã xong, BE không cần làm gì)

Project Expo (`@namnhi993/nltask`) đã có APNs push key gắn qua `eas credentials` (dùng chung key với
`nl-livescreen`, cùng Apple Team). BE không cần tự quản lý cert/key APNs — cứ gửi qua Expo Push API,
Expo tự ký với Apple.

## 7. Cách BE tự test thủ công

```bash
node scripts/send-test-notification.js task_overdue
```

Script bắn thẳng 1 request tới Expo Push API với token hardcode sẵn trong file, không đụng DB/cron —
dùng để xác nhận credentials + thiết bị nhận được thông báo trước khi tin cron logic đúng.

## Đã chốt (implemented)

- BE dùng Node.js + Express + Prisma (MySQL).
- Cột đánh dấu "đã nhắc" là `Task.remindedAt` (đã thêm, cùng `Task.lastOverdueNotifiedAt` cho
  dedupe `task_overdue` theo ngày).
- Cả 3 loại `data.type` đều đã có nơi trigger thật: `task_reminder`/`task_overdue` qua cron
  `backend/src/jobs/task-reminder-scheduler.js`, `task_updated` qua hook trong
  `backend/src/services/tasks-service.js` (`updateTask()`). Chi tiết kiến trúc:
  `docs/system-architecture.md` mục "Push notification (mobile)".
