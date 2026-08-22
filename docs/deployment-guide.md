# Deployment Guide - NLTASK Backend

## 1. Yêu cầu

- Node.js 18+ (khuyến nghị LTS mới nhất)
- MySQL 8+ hoặc MariaDB 10.6+ đang chạy, có thể kết nối được

## 2. Setup MySQL/MariaDB local nhanh nhất

Nếu chưa có server sẵn, dùng Docker:

```bash
docker run --name nltask-mysql -e MYSQL_ROOT_PASSWORD=changeme -p 3306:3306 -d mysql:8
```

Nếu đã có MySQL/MariaDB server chạy sẵn (native service, XAMPP, Laragon...), chỉ cần tạo database:

```sql
CREATE DATABASE nltask CHARACTER SET utf8mb4;
```

Khuyến nghị tạo user riêng cho project thay vì dùng `root`:

```sql
CREATE USER 'nltask_app'@'localhost' IDENTIFIED BY 'mot-password-manh';
GRANT ALL PRIVILEGES ON nltask.* TO 'nltask_app'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Biến môi trường (`backend/.env`)

| Biến | Ý nghĩa |
|---|---|
| `DATABASE_URL` | Connection string MySQL, dạng `mysql://user:password@host:port/database` |
| `JWT_ACCESS_SECRET` | Secret ký access token (không được để trống hoặc dùng giá trị mẫu trong `.env.example`) |
| `JWT_REFRESH_SECRET` | Secret dự phòng cho refresh token flow |
| `JWT_ACCESS_EXPIRES_IN` | Thời hạn access token, mặc định `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Thời hạn refresh token, mặc định `30d` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Thông tin admin đầu tiên, server tự tạo lúc boot nếu DB chưa có admin nào |
| `APP_TIMEZONE` | Timezone dùng để tính "hôm nay/quá hạn/streak/tuần", mặc định `Asia/Ho_Chi_Minh` |
| `PORT` | Port HTTP server, mặc định `4000` |

## 4. Migrate

```bash
cd backend
npx prisma migrate dev --name init
```

Lệnh này tạo bảng `users`, `tasks`, `settings`, `refresh_tokens` trên DB đã cấu hình trong `DATABASE_URL`.

**Backup trước khi migrate/reset trên DB có dữ liệu thật:**

```bash
mysqldump -u <user> -p nltask > nltask-backup-$(date +%Y%m%d%H%M%S).sql
```

Reset DB (⚠️ xoá toàn bộ dữ liệu, chỉ dùng ở môi trường dev):

```bash
npx prisma migrate reset
```

## 5. Chạy server

```bash
npm run dev    # nodemon, tự reload khi sửa code
# hoặc
npm start      # chạy production, không watch
```

## 6. Kiểm tra nhanh

```bash
curl http://localhost:4000/health
# {"status":"ok"}
```
