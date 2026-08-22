---
title: "Phase 6: Settings Module"
status: todo
---

# Phase 6: Settings Module

## Overview

- Priority: P1
- Status: Pending
- Get/update settings (thông báo, nhắc trước, snooze, giờ im lặng) của user hiện tại — 1-1
  với `User`, đã được tạo mặc định lúc `createUser` (phase 3) hoặc bootstrap admin (phase 2).

## Key Insights

- UI có các field: `push`/`sound`/`vibrate` (bool switch), `remindBefore` (0/5/15/30 phút),
  `snooze` (5/10/15/20 phút), `quietStart`/`quietEnd` (chuỗi "HH:mm"). Khớp 1:1 với model
  `Settings` đã định nghĩa ở phase 1 — không cần thêm field.
- Vì `Settings` được tạo kèm lúc tạo user (phase 3 service) và lúc bootstrap admin (phase 2),
  `GET /api/settings` **luôn** tìm thấy record — nhưng vẫn nên code phòng hờ: nếu vì lý do gì
  đó (dữ liệu cũ, thao tác tay trên DB) chưa có Settings, tự tạo bằng default khi `GET` lần
  đầu (`upsert`) thay vì trả lỗi — đơn giản hơn ép mọi migration phải chạy seed bù.
- `quietStart`/`quietEnd` chỉ validate format `HH:mm` (regex), không validate logic
  start<end vì UI demo cũng cho phép khoảng qua nửa đêm (ví dụ 22:00 → 07:00 là hợp lệ).

## Requirements

- [x] `GET /api/settings` — trả settings của `req.user.id` (upsert-default nếu chưa có)
- [x] `PATCH /api/settings` — sửa 1 hoặc nhiều field cùng lúc, chỉ field hợp lệ trong payload
  mới được update (partial update)

## Architecture

```
src/
├── routes/
│   └── settings-routes.js
├── controllers/
│   └── settings-controller.js
└── services/
    └── settings-service.js
```

## Related Code Files

**Tạo mới:**
- `backend/src/services/settings-service.js`
- `backend/src/controllers/settings-controller.js`
- `backend/src/routes/settings-routes.js`

**Sửa:**
- `backend/src/app.js` — mount `app.use('/api/settings', authMiddleware, settingsRoutes)`

## Implementation Steps

1. `settings-service.js`:
   - `getSettings(userId)`: `prisma.settings.upsert({where:{userId}, update:{}, create:{userId}})`
     — `create` dùng toàn bộ default đã khai báo trong schema (không cần liệt kê field).
   - `updateSettings(userId, patch)`: `prisma.settings.update({where:{userId}, data:patch})` —
     đảm bảo settings đã tồn tại trước (gọi `getSettings` trước nếu cần) để tránh lỗi "record
     not found" khi user PATCH trước khi từng GET.
2. `settings-controller.js`: zod schema optional cho từng field
   (`push/sound/vibrate: boolean`, `remindBefore: enum [0,5,15,30]`, `snooze: enum
   [5,10,15,20]`, `quietStart/quietEnd: regex /^([01]\d|2[0-3]):[0-5]\d$/`), chỉ pick field có
   mặt trong body.
3. `settings-routes.js`: 2 route GET/PATCH.

## Todo

- [x] `settings-service.js` (getSettings upsert, updateSettings)
- [x] `settings-controller.js` + zod partial schema
- [x] `settings-routes.js`, mount vào `app.js`

## Success Criteria

- User mới (chưa từng GET settings) gọi `PATCH /api/settings {"push": false}` → không lỗi,
  trả settings đã update với các field khác giữ default
- `PATCH` với `remindBefore: 999` (ngoài enum cho phép) → 400
- 2 user khác nhau có settings độc lập, sửa của người này không ảnh hưởng người kia

## Risk Assessment

- **Rủi ro thấp** — module đơn giản nhất, ít bề mặt lỗi.

## Security Considerations

- Không khác các phase trước — scope theo `req.user.id`.

## Next Steps

- Sau phase 4/5/6 xong, chuyển sang phase 7 viết docs + verify toàn bộ endpoint.
