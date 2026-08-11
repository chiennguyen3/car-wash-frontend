# Car Wash Frontend

FE cơ bản (React + TypeScript + Vite) cho app đặt lịch rửa xe, sẵn sàng ghép với BE.

## Cài đặt

```bash
npm install
cp .env.example .env   # rồi sửa VITE_API_URL trỏ về BE của bạn
npm run dev
```

## Cấu trúc

- `src/api/` — các hàm gọi API (auth, services, bookings) qua `fetch`, tự gắn Bearer token.
- `src/context/AuthContext.tsx` — quản lý trạng thái đăng nhập toàn app.
- `src/components/` — Navbar, ProtectedRoute, ServiceCard.
- `src/pages/` — Home, Services, Booking (cần đăng nhập), Login, Register, MyBookings (cần đăng nhập).
- `src/types/` — interface dùng chung, chỉnh lại field cho khớp response thật của BE.

## Endpoint BE mà FE đang gọi (chỉnh lại cho khớp)

- `POST /auth/login` → `{ token, user }`
- `POST /auth/register` → `{ token, user }`
- `GET /auth/me` → `User`
- `GET /services` → `Service[]`
- `GET /services/:id` → `Service`
- `POST /bookings` → `Booking`
- `GET /bookings/me` → `Booking[]`
- `DELETE /bookings/:id` → `204`

Đổi field/route trong `src/types/index.ts` và `src/api/*.ts` cho khớp BE thực tế của bạn.
