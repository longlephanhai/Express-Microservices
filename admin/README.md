# Express Microservices - Admin Portal

Trang quản trị (Admin Dashboard) được xây dựng độc lập cho hệ thống **Express Microservices**, sử dụng **React 19**, **TypeScript** và **Redux Toolkit** làm trung tâm quản lý trạng thái, hoàn toàn tách biệt khỏi ứng dụng storefront (`frontend`).

---

## 🚀 Công nghệ sử dụng

- **React 19** (`react: ^19.2.x`, `react-dom: ^19.2.x`) - Phiên bản React mới nhất với hiệu năng vượt trội.
- **TypeScript** - Kiểu dữ liệu chặt chẽ cho toàn bộ models, API requests/responses và Redux state.
- **Redux Toolkit & React-Redux** - Quản lý trạng thái tập trung với typed hooks (`useAppDispatch`, `useAppSelector`) và async thunks.
- **Vite 8** - Build tool siêu tốc, hỗ trợ Hot Module Replacement (HMR).
- **React Router** (`react-router-dom: ^7.x`) - Quản lý định tuyến và bảo vệ route (`ProtectedRoute`).
- **Lucide Icons** - Bộ icon hiện đại, sắc nét.
- **Vanilla CSS Design System** - Thiết kế giao diện cao cấp, hỗ trợ chuyển đổi linh hoạt chế độ Sáng / Tối (Dark / Light mode), hiệu ứng Glassmorphism và micro-animations.

---

## 📁 Cấu trúc Thư mục (`admin/`)

```text
admin/
├── public/                     # Static assets
├── src/
│   ├── api/                    # Centralized Axios client & API endpoints
│   │   ├── axiosClient.ts      # Axios instance kèm JWT interceptor & auto logout
│   │   ├── authApi.ts          # Gọi API Gateway /v1/auth
│   │   ├── brandApi.ts         # Gọi /v1/brands
│   │   ├── categoryApi.ts      # Gọi /v1/categories
│   │   ├── productApi.ts       # Gọi /v1/products
│   │   ├── orderApi.ts         # Gọi /v1/orders
│   │   ├── userApi.ts          # Gọi /v1/users
│   │   └── gatewayApi.ts       # Healthcheck API Gateway /health
│   │
│   ├── app/                    # Redux Toolkit Store configuration
│   │   ├── store.ts            # Cấu hình store
│   │   ├── hooks.ts            # useAppDispatch & useAppSelector
│   │   └── rootReducer.ts      # Tổng hợp các reducer slices
│   │
│   ├── features/               # Redux Slices phân theo domain
│   │   ├── auth/authSlice.ts           # Quản lý đăng nhập, session admin
│   │   ├── products/productSlice.ts    # CRUD sản phẩm, bộ lọc, tìm kiếm
│   │   ├── categories/categorySlice.ts # CRUD danh mục đa cấp
│   │   ├── brands/brandSlice.ts        # CRUD thương hiệu
│   │   ├── orders/orderSlice.ts        # Quản lý đơn hàng & trạng thái vận chuyển
│   │   ├── users/userSlice.ts          # Quản lý danh sách tài khoản & phân quyền
│   │   └── ui/uiSlice.ts               # Theme (Dark/Light), Sidebar collapsed, Toasts
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── common/             # Button, Input, Select, Badge, Card, StatCard, Modal, Spinner, Toast
│   │   ├── feedback/           # ConfirmModal (xác nhận xóa), EmptyState
│   │   └── layout/             # AdminLayout, Sidebar (thu gọn/mở rộng), Header
│   │
│   ├── pages/                  # Trang hiển thị chính
│   │   ├── auth/LoginPage.tsx
│   │   ├── dashboard/DashboardPage.tsx # KPI, Healthcheck Microservices, Đơn gần đây
│   │   ├── products/ProductListPage.tsx # Quản lý danh sách, thêm/sửa/xóa sản phẩm
│   │   ├── categories/CategoryListPage.tsx # Quản lý danh mục
│   │   ├── brands/BrandListPage.tsx        # Quản lý thương hiệu
│   │   ├── orders/OrderListPage.tsx        # Quản lý đơn hàng, chi tiết & chuyển trạng thái
│   │   ├── users/UserListPage.tsx          # Quản lý người dùng
│   │   ├── settings/SettingsPage.tsx       # Thông tin cổng Microservices & Redux state
│   │   └── not-found/NotFoundPage.tsx
│   │
│   ├── routes/                 # Quản lý điều hướng
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── types/                  # Định nghĩa TypeScript Interfaces
│   ├── utils/                  # formatters (VNĐ, ngày tháng), storage, mock fallback
│   ├── index.css               # Hệ thống design tokens & dark mode
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Hướng dẫn Khởi chạy

### 1. Cài đặt Dependencies
```bash
cd admin
npm install
```

### 2. Cấu hình Biến Môi trường
File `.env` mặc định trỏ tới API Gateway cục bộ:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Express Microservices Admin Portal
```

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Trang quản trị sẽ khả dụng tại: `http://localhost:5173`

### 4. Build Production
```bash
npm run build
```

---

## 🔐 Đăng nhập Quản trị

Khi truy cập vào hệ thống tại `/login`:
- Có thể nhập tài khoản admin của hệ thống backend.
- Hoặc bấm nút **"Vào ngay với quyền Super Admin Demo"** để thử nghiệm ngay lập tức các tính năng mà không cần khởi động database trước.
- Hệ thống hỗ trợ **Graceful Fallback**: Nếu Docker backend chưa bật, giao diện sẽ sử dụng Mock Data phong phú để bạn kiểm thử đầy đủ UI/UX; khi backend bật, hệ thống sẽ tự động gọi REST API qua API Gateway port 3000.
