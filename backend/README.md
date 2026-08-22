# NLTASK Backend

REST API cho ứng dụng NLTASK (todo/task manager), Express + Prisma (MySQL/MariaDB) + JWT auth.

## Quick start

```bash
cd backend
npm install
cp .env.example .env
# điền DATABASE_URL thật (MySQL/MariaDB đang chạy sẵn) + JWT secrets vào .env
npx prisma migrate dev
npm run dev
```

Server mặc định chạy ở `http://localhost:4000`, health check tại `GET /health`.

Lần đầu boot, nếu DB chưa có user role ADMIN, server tự tạo 1 admin từ
`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` trong `.env`.

Chi tiết setup MySQL, danh sách biến môi trường, kiến trúc và endpoint: xem
`../docs/deployment-guide.md` và `../docs/system-architecture.md`.
