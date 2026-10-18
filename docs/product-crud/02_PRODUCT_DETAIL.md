# TÀI LIỆU KẾT NỐI PHÂN TRANG, LỌC DANH MỤC & CHI TIẾT SẢN PHẨM (GIAI ĐOẠN 2)

---

## 1. Mục tiêu và phạm vi thực hiện

Trong khuôn khổ **Giai đoạn 2** của đề tài môn Điện toán đám mây (*“Triển khai hệ thống Microservice trên Cloud bằng Docker với bảo mật API (JWT, HTTPS) và quản lý tài nguyên: Case Study trên Render”*), nhiệm vụ tập trung vào việc hoàn thiện trải nghiệm duyệt sản phẩm của người dùng trên thương hiệu LUMORA:
1. **Lọc sản phẩm theo danh mục chuẩn:** Cập nhật thanh danh mục đúng thứ tự (`ALL`, `CLOTHING`, `DRESSES`, `SHOES`, `BAG`, `SETS`, `ACCESSORIES`) và ánh xạ chính xác sang các `category_id` trong cơ sở dữ liệu MySQL.
2. **Tải đầy đủ dữ liệu qua phân trang API:** Sử dụng `limit=20`, đọc metadata `paging.total` thực tế từ API backend để tải tuần tự tất cả các trang, gom đủ 100% dữ liệu mà không hardcode số trang hay số lượng sản phẩm.
3. **Phân trang giao diện linh hoạt:** Sau khi lọc theo danh mục, tính toán số trang độc lập cho từng danh mục (`ITEMS_PER_PAGE = 20`), có nút `Prev`, các số trang động và `Next`. Tự động quay về trang 1 khi chuyển đổi danh mục.
4. **Trang chi tiết sản phẩm:** Kết nối dynamic route `frontend/app/products/[id]/page.tsx` và gọi API `GET /v1/products/:id` để hiển thị dữ liệu thật (tên, giá, giá khuyến mãi, mô tả, màu sắc, số lượng tồn kho, thương hiệu LUMORA, danh mục).
5. **Bảo toàn chức năng & hệ thống:** Tuyệt đối không can thiệp backend, không sửa schema CSDL hay các chức năng giỏ hàng, thanh toán, auth của thành viên khác.

---

## 2. Khảo sát kỹ thuật & Giải pháp kiến trúc

### 2.1. Phân tích xung đột lọc danh mục tại Backend vs CSDL thực tế
Khi khảo sát trực tiếp API backend:
- Trong CSDL MySQL: Cột `category_id` của bảng `products` lưu trữ các mã chuỗi như `'cat-001'`, `'cat-002'`, ..., `'cat-010'`.
- Trong mã nguồn backend (`backend/src/modules/product/model/dto.ts`):
  ```typescript
  export const ProductCondSchema = z.object({
      categoryId: z.string().uuid(ErrCategoryIdMustBeValidUUID).optional(),
  });
  ```
  Schema kiểm tra query parameter `categoryId` bắt buộc phải là định dạng **UUID chuẩn**.
- Khi gửi request `GET /v1/products?categoryId=cat-009`, backend phản hồi lỗi `HTTP 400 Bad Request`: `"Category ID must be a valid UUID"`.
- Thêm vào đó, nhóm danh mục `CLOTHING` gồm 5 mã danh mục (`cat-001` đến `cat-005`), trong khi API backend hiện tại chỉ nhận 1 `categoryId` duy nhất trên query string.

### 2.2. Giải pháp kỹ thuật đã thống nhất
Tuân thủ nguyên tắc **không can thiệp backend** và **không lọc riêng trên 20 sản phẩm của một trang đơn lẻ**:
- Frontend thực hiện nạp trang 1 với `limit=20` để đọc metadata phân trang thực tế (`paging.total`).
- Tính toán tổng số trang (`Math.ceil(total / limit)`) và thực hiện nạp tuần tự các trang tiếp theo để gom toàn bộ dữ liệu vào một `Map` (loại bỏ trùng lặp sản phẩm theo `id`).
- Xử lý bộ lọc danh mục và phân trang ngay trên toàn bộ tập dữ liệu đã xác thực:
  - Danh mục `ALL`: Hiển thị toàn bộ sản phẩm (60 sản phẩm tương ứng với 3 trang).
  - Danh mục `CLOTHING`: Lọc các sản phẩm có `categoryId` thuộc `['cat-001', 'cat-002', 'cat-003', 'cat-004', 'cat-005']`.
  - Danh mục `DRESSES`: Lọc `['cat-006', 'cat-007']`.
  - Danh mục `SHOES`: Lọc `['cat-008']`.
  - Danh mục `BAG`: Lọc `['cat-009']`.
  - Danh mục `SETS`: Hiển thị trạng thái rỗng đặc thù (`The SETS collection is currently being curated.`) do CSDL chưa có danh mục bộ đồ riêng, không tự ý suy diễn.
  - Danh mục `ACCESSORIES`: Lọc `['cat-010']`.
- Mỗi danh mục có thanh phân trang phản ánh đúng số lượng sản phẩm của danh mục đó (không dùng chung phân trang của `ALL`).

---

## 3. Các thay đổi chi tiết trong mã nguồn

### 3.1. Route trang chi tiết sản phẩm (`frontend/app/products/[id]/page.tsx`)
Next.js 16 (App Router) xử lý dynamic route `params` dưới dạng một `Promise`. File được cấu hình để trích xuất `id` bất đồng bộ và truyền vào `ProductDetailPage`:
```tsx
import ProductDetailPage from '@/components/pages/product-detail-page'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <ProductDetailPage productId={id} />
}
```

### 3.2. Component trung gian (`frontend/components/pages/product-detail-page.tsx`)
Nhận prop `productId` và chuyển tiếp cho `Storefront`:
```tsx
import Storefront from '@/components/storefront'

export default function ProductDetailPage({ productId }: { productId?: string }) {
  return <Storefront initialView="detail" initialProductId={productId} />
}
```

### 3.3. Cải tiến giao diện Storefront (`frontend/components/storefront.tsx`)
1. **Bổ sung ánh xạ danh mục & tên chi tiết:**
   - Định nghĩa mảng thứ tự: `CATEGORIES = ['ALL', 'CLOTHING', 'DRESSES', 'SHOES', 'BAG', 'SETS', 'ACCESSORIES']`.
   - Bảng ánh xạ nhóm: `CATEGORY_MAP` liên kết từng danh mục với các mã `cat-001` .. `cat-010`.
   - Bảng tên hiển thị: `CATEGORY_NAMES` chuyển đổi mã sang tên tiếng Việt thanh lịch (ví dụ: `'cat-009'` -> `'Túi xách'`).
2. **Cơ chế tải toàn bộ sản phẩm đa trang an toàn:**
   - Tạo `loadAllProducts` trong `useEffect` với `AbortController`.
   - Nạp trang 1, trích xuất `paging.total` để xác định `totalPages`.
   - Chạy vòng lặp tuần tự tải từ trang 2 đến `totalPages`.
   - Sử dụng `Map<string, ApiProduct>` để chống trùng lặp dữ liệu.
   - Nếu xảy ra lỗi mạng ở bất kỳ trang nào, bắt lỗi và hiển thị thông báo kèm nút **Retry** (tăng `retryKey`), không rơi vào vòng lặp vô hạn.
3. **Phân trang giao diện theo từng danh mục:**
   - Quản lý `currentPage` và `activeCategory`.
   - Khi người dùng đổi danh mục qua hàm `handleSelectCategory`, tự động đặt `currentPage = 1`.
   - Tính toán `totalCategoryPages` theo danh sách đã lọc.
   - Nút `Prev` bị vô hiệu hóa (disabled) khi ở trang 1; nút `Next` bị vô hiệu hóa khi ở trang cuối.
4. **Trang chi tiết sản phẩm chuẩn API `GET /v1/products/:id`:**
   - Quản lý `selectedId`, `detailLoading`, `detailError`, `detailRetryKey`.
   - Gọi API lấy dữ liệu chi tiết thật từ backend khi mở chi tiết hoặc truy cập trực tiếp qua URL.
   - Hiển thị đầy đủ thông tin: Tên sản phẩm, giá gốc, giá khuyến mãi (`salePrice`), số lượng tồn kho (`quantity`), màu sắc (`color`), mô tả (`description`), thương hiệu (`LUMORA`), tên danh mục tiếng Việt.
   - Xử lý mã lỗi HTTP 404 ("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh") và có nút quay về bộ sưu tập ("Back to collection").
   - Cơ chế chọn ảnh ổn định `getProductImage`: tính hash từ ID sản phẩm để đảm bảo cùng 1 sản phẩm luôn hiển thị đúng 1 ảnh trong mảng `HARD_CODED_IMAGES`.

---

## 4. Kết quả kiểm thử thực tế

### 4.1. Kiểm tra tĩnh TypeScript
```powershell
cd frontend
npx tsc --noEmit
```
- **Kết quả:** Mã thoát 0 (Exit code 0). Không có bất kỳ lỗi cú pháp hay kiểu dữ liệu nào.

### 4.2. Kiểm tra đóng gói Next.js (Production Build)
```powershell
cd frontend
npm run build
```
- **Kết quả:** Mã thoát 0 (Exit code 0).
- Turbopack biên dịch thành công 8/8 routes trong 1639ms.
- Route động `ƒ /products/[id]` được nhận diện và đóng gói thành công ở chế độ Server-rendered on demand.

### 4.3. Kiểm thử tích hợp với API Gateway thật (Port 3000)
- `GET /v1/products?page=1&limit=20` -> 20 sản phẩm, `total: 60`.
- `GET /v1/products?page=2&limit=20` -> 20 sản phẩm.
- `GET /v1/products?page=3&limit=20` -> 20 sản phẩm (Tổng 3 trang = 60 sản phẩm).
- `GET /v1/products/fe8ca5d4-b9d3-4c51-ae8c-898deefd7636` -> HTTP 200, trả về đầy đủ chi tiết sản phẩm thật.
- `GET /v1/products/00000000-0000-0000-0000-000000000000` -> HTTP 404 Not Found, xử lý lỗi chuẩn xác.

---

## 5. Rà soát tệp tin thay đổi (Git Scope Check)
Lệnh `git diff --stat` ghi nhận thay đổi chỉ giới hạn trong:
- `frontend/app/products/[id]/page.tsx`: Cập nhật nhận `params` bất đồng bộ.
- `frontend/components/pages/product-detail-page.tsx`: Nhận và truyền `productId`.
- `frontend/components/storefront.tsx`: Bổ sung nạp đa trang, phân trang UI, lọc danh mục và trang chi tiết.
- Các file build tự sinh: `frontend/next-env.d.ts`, `frontend/tsconfig.tsbuildinfo`.
- Hoàn toàn **không chạm vào backend**, **không sửa giỏ hàng, thanh toán, auth** hay bất kỳ microservice nào khác.

---

## 6. Sửa lỗi đồng bộ ảnh giữa Danh sách và Trang chi tiết

### 6.1. Nguyên nhân
Trước khi sửa, hàm `getProductImage(id, index)` có điều kiện ưu tiên:
```typescript
if (typeof index === 'number' && index >= 0) {
  return HARD_CODED_IMAGES[index % HARD_CODED_IMAGES.length];
}
```
Khi duyệt mảng danh sách sản phẩm, `allRaw.map((item, idx) => mapApiProduct(item, idx))` đã truyền `idx` (vị trí 0, 1, 2, ...), khiến sản phẩm nhận ảnh theo thứ tự mảng. Trong khi đó, tại hàm `loadProductDetail`, `mapApiProduct(json.data)` không có `index` nên rơi vào nhánh hash ID. Hệ quả là khi bấm từ danh sách sang chi tiết, ảnh bị thay đổi sang ảnh tính theo hash.

### 6.2. Giải pháp khắc phục
1. Loại bỏ hoàn toàn tham số `index` khỏi `getProductImage(id: string)` và `mapApiProduct(item: ApiProduct)`.
2. Ánh xạ 100% ảnh cố định theo thuật toán hash chuỗi `product.id` sang 6 ảnh trong `HARD_CODED_IMAGES`.
3. Đảm bảo dù sản phẩm hiển thị ở trang 1, 2, 3; lọc theo danh mục bất kỳ; hay mở trực tiếp URL `/products/[id]` hoặc F5 tải lại trang, cùng một `product.id` luôn luôn nhận về duy nhất một URL ảnh cố định.

### 6.3. Kết quả kiểm thử đối chiếu
- Đã chạy kiểm thử Node.js đối chiếu 3 sản phẩm mẫu ở 3 trang khác nhau và toàn bộ 60/60 sản phẩm trong CSDL: **Mismatches: 0** (khớp ảnh 100% giữa danh sách và chi tiết).
- Build production Next.js và TypeScript check đạt Exit code 0.

