-- ==============================================================================
-- DATABASE SEED DATA FOR EXPRESS MICROSERVICES
-- Users:
--   1. Admin: admin@example.com | Password: Password123@ | Role: admin
--   2. User:  user@example.com  | Password: Password123@ | Role: user
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS
DELETE FROM `users`;
INSERT INTO `users` (
  `id`, `first_name`, `last_name`, `email`, `password`, `salt`, `phone`, `address`, `status`, `avatar`, `gender`, `role`, `birthday`, `created_at`, `updated_at`
) VALUES
(
  'a0000000-0000-4000-8000-000000000001',
  'System',
  'Admin',
  'admin@example.com',
  '$2b$10$G1BAe60PZjSTenu3WJy30eJ43luiRdIk.tMLnBJis4RXjU/Nmt5SO',
  '$2b$10$G1BAe60PZjSTenu3WJy30e',
  '0901234567',
  '123 Le Loi, Ben Nghe, Quan 1, TP.HCM',
  'active',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'male',
  'admin',
  '1995-01-01 00:00:00',
  NOW(),
  NOW()
),
(
  'b0000000-0000-4000-8000-000000000002',
  'Van A',
  'Nguyen',
  'user@example.com',
  '$2b$10$G1BAe60PZjSTenu3WJy30eJ43luiRdIk.tMLnBJis4RXjU/Nmt5SO',
  '$2b$10$G1BAe60PZjSTenu3WJy30e',
  '0987654321',
  '456 Nguyen Hue, Ben Nghe, Quan 1, TP.HCM',
  'active',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'male',
  'user',
  '1998-05-15 00:00:00',
  NOW(),
  NOW()
);

-- 2. BRANDS
DELETE FROM `brands`;
INSERT INTO `brands` (
  `id`, `name`, `image`, `tag_line`, `description`, `status`, `created_at`, `updated_at`
) VALUES
(
  '10000000-0000-4000-8000-000000000001',
  'Nike',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
  'Just Do It',
  'Thương hiệu thể thao hàng đầu thế giới với các dòng giày và trang phục đẳng cấp.',
  'active',
  NOW(),
  NOW()
),
(
  '10000000-0000-4000-8000-000000000002',
  'Adidas',
  'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=300',
  'Impossible is Nothing',
  'Thời trang thể thao và phong cách sống hiện đại, bền bỉ và thời thượng.',
  'active',
  NOW(),
  NOW()
),
(
  '10000000-0000-4000-8000-000000000003',
  'Puma',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300',
  'Forever Faster',
  'Đột phá về tốc độ và phong cách thể thao đường phố cá tính.',
  'active',
  NOW(),
  NOW()
),
(
  '10000000-0000-4000-8000-000000000004',
  'Apple',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300',
  'Think Different',
  'Thiết bị công nghệ cao cấp hàng đầu với thiết kế sang trọng và hiệu năng vượt trội.',
  'active',
  NOW(),
  NOW()
),
(
  '10000000-0000-4000-8000-000000000005',
  'Samsung',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300',
  'Inspire the World, Create the Future',
  'Tập đoàn công nghệ điện tử hàng đầu với các dòng sản phẩm thông minh phong phú.',
  'active',
  NOW(),
  NOW()
);

-- 3. CATEGORIES
DELETE FROM `categories`;
INSERT INTO `categories` (
  `id`, `name`, `image`, `parent_id`, `description`, `position`, `status`, `created_at`, `updated_at`
) VALUES
(
  '20000000-0000-4000-8000-000000000001',
  'Giày Thể Thao',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
  NULL,
  'Các dòng giày thể thao chạy bộ, tập gym và thời trang dạo phố.',
  1,
  'active',
  NOW(),
  NOW()
),
(
  '20000000-0000-4000-8000-000000000002',
  'Quần Áo Thể Thao',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300',
  NULL,
  'Trang phục tập luyện, áo thun thoáng khí, quần jogger thể thao năng động.',
  2,
  'active',
  NOW(),
  NOW()
),
(
  '20000000-0000-4000-8000-000000000003',
  'Phụ Kiện Thời Trang',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
  NULL,
  'Balo, nón, tất thể thao và phụ kiện hỗ trợ tập luyện.',
  3,
  'active',
  NOW(),
  NOW()
),
(
  '20000000-0000-4000-8000-000000000004',
  'Đồ Điện Tử & Công Nghệ',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
  NULL,
  'Tai nghe thông minh, đồng hồ thể thao và phụ kiện công nghệ.',
  4,
  'active',
  NOW(),
  NOW()
);

-- 4. PRODUCTS
DELETE FROM `products`;
INSERT INTO `products` (
  `id`, `name`, `images`, `price`, `sale_price`, `colors`, `quantity`, `brand_id`, `category_id`, `description`, `content`, `gender`, `status`, `created_at`, `updated_at`
) VALUES
(
  '30000000-0000-4000-8000-000000000001',
  'Giày Sneaker Nike Air Max 270',
  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600"]',
  3500000.00,
  2990000.00,
  'Đỏ, Đen, Trắng',
  50,
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Thiết kế đệm khí Max Air lớn nhất ở gót chân mang lại cảm giác siêu êm ái cả ngày dài.',
  'Thân giày bằng vải dệt lưới thông thoáng, cổ giày ôm sát tạo độ linh hoạt khi di chuyển.',
  'unisex',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000002',
  'Giày Chạy Bộ Adidas Ultraboost Light',
  '["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600", "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600"]',
  4200000.00,
  3600000.00,
  'Trắng, Xanh Navy',
  40,
  '10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000001',
  'Dòng giày chạy bộ công nghệ đệm Light Boost nhẹ hơn 30% giúp hoàn trả năng lượng tối ưu.',
  'Đế ngoài làm bằng cao su Continental bám đường chắc chắn trong mọi điều kiện thời tiết.',
  'unisex',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000003',
  'Áo Thun Thể Thao Nam Nike Pro Dri-FIT',
  '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"]',
  850000.00,
  690000.00,
  'Đen, Xám',
  100,
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  'Áo ôm body co giãn 4 chiều hỗ trợ cơ bắp trong các bài tập gym cường độ cao.',
  'Công nghệ Dri-FIT hút ẩm và thoát mồ hôi cực nhanh giúp cơ thể luôn khô thoáng mát mẻ.',
  'male',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000004',
  'Quần Dài Nỉ Thể Thao Adidas Tiro 23',
  '["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600"]',
  1200000.00,
  990000.00,
  'Đen Sọc Trắng',
  60,
  '10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002',
  'Chiếc quần kinh điển của Adidas với 3 sọc dọc thân quần và khóa zip ở mắt cá chân.',
  'Chất vải thun nỉ tái chế cao cấp, mềm mại và chống nhăn hiệu quả.',
  'unisex',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000005',
  'Balo Thể Thao Puma Phase Backpack',
  '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"]',
  650000.00,
  490000.00,
  'Đen, Xanh Dương',
  80,
  '10000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000003',
  'Balo kích thước tiêu chuẩn 22L có ngăn chứa laptop và các ngăn phụ tiện dụng.',
  'Chất liệu polyester bền bỉ chống thấm nước nhẹ, quai đeo êm ái.',
  'unisex',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000006',
  'Tai Nghe Không Dây Apple AirPods Pro 2',
  '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600"]',
  5990000.00,
  5290000.00,
  'Trắng',
  30,
  '10000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000004',
  'Công nghệ khử tiếng ồn chủ động ANC thế hệ mới gấp 2 lần và âm thanh không gian Spatial Audio.',
  'Thời lượng pin lên đến 30 giờ kèm hộp sạc MagSafe tiện lợi.',
  'unisex',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000007',
  'Đồng Hồ Thông Minh Samsung Galaxy Watch 6',
  '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"]',
  6990000.00,
  5990000.00,
  'Đen, Bạc',
  25,
  '10000000-0000-4000-8000-000000000005',
  '20000000-0000-4000-8000-000000000004',
  'Theo dõi chỉ số sức khỏe, nhịp tim, giấc ngủ và đo thành phần cơ thể BIA chuẩn xác.',
  'Màn hình Sapphire chống trầy xước và viền bezel mỏng tinh tế.',
  'unisex',
  'active',
  NOW(),
  NOW()
),
(
  '30000000-0000-4000-8000-000000000008',
  'Nón Lưỡi Trai Nike Heritage86',
  '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"]',
  450000.00,
  390000.00,
  'Đen, Trắng',
  120,
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000003',
  'Nón lưỡi trai chất liệu cotton twill mềm mại, khóa cài phía sau dễ dàng điều chỉnh.',
  'Logo Nike Futura thêu nổi bật phía trước tạo phong cách năng động.',
  'unisex',
  'active',
  NOW(),
  NOW()
);

-- 5. CARTS
DELETE FROM `carts`;
INSERT INTO `carts` (
  `id`, `user_id`, `product_id`, `attribute`, `quantity`, `created_at`, `updated_at`
) VALUES
(
  '40000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000001',
  'Size: 42, Color: Đen',
  1,
  NOW(),
  NOW()
),
(
  '40000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
  'Size: L, Color: Đen',
  2,
  NOW(),
  NOW()
);

-- 6. ORDERS
DELETE FROM `orders`;
INSERT INTO `orders` (
  `id`, `user_id`, `shipping_address`, `shipping_city`, `shipping_method`, `payment_method`, `payment_status`, `recipient_first_name`, `recipient_last_name`, `recipient_phone`, `recipient_email`, `tracking_number`, `status`, `created_at`, `updated_at`
) VALUES
(
  '50000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  '456 Nguyen Hue, Ben Nghe, Quan 1',
  'TP. Hồ Chí Minh',
  'standard',
  'cod',
  'pending',
  'Van A',
  'Nguyen',
  '0987654321',
  'user@example.com',
  'TRACK89218291',
  'shipping',
  NOW(),
  NOW()
),
(
  '50000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000002',
  '123 Le Loi, Ben Nghe, Quan 1',
  'TP. Hồ Chí Minh',
  'free',
  'zalo',
  'paid',
  'Van A',
  'Nguyen',
  '0987654321',
  'user@example.com',
  'TRACK99882211',
  'delivered',
  NOW(),
  NOW()
);

-- 7. ORDER ITEMS
DELETE FROM `order_items`;
INSERT INTO `order_items` (
  `id`, `order_id`, `product_id`, `attribute`, `image`, `name`, `quantity`, `price`
) VALUES
(
  '60000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'Size: 42, Color: Đen',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  'Giày Sneaker Nike Air Max 270',
  1,
  2990000.00
),
(
  '60000000-0000-4000-8000-000000000002',
  '50000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000003',
  'Size: L, Color: Đen',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
  'Áo Thun Thể Thao Nam Nike Pro Dri-FIT',
  1,
  690000.00
),
(
  '60000000-0000-4000-8000-000000000003',
  '50000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000006',
  'Standard, Color: Trắng',
  'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600',
  'Tai Nghe Không Dây Apple AirPods Pro 2',
  1,
  5290000.00
);

SET FOREIGN_KEY_CHECKS = 1;
