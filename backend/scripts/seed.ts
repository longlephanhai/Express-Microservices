import { config } from "dotenv";
config();

import bcrypt from "bcryptjs";
import { createSequelize } from "../src/share/component/sequelize";
import { init as initBrand, BrandPersistence } from "../src/modules/brand/infras/repository/sequelize/dto";
import { init as initCategory, CategoryPersistence } from "../src/modules/category/infras/repository/dto";
import { init as initProduct, ProductPersistence } from "../src/modules/product/insfra/repository/mysql/dto";
import { init as initUser, UserPersistence } from "../src/modules/user/infras/repository/mysql/dto";
import { init as initCart, CartPersistence } from "../src/modules/cart/infras/repository/dto";
import { init as initOrder, OrderPersistence, OrderItemPersistence } from "../src/modules/orders/infras/repository/sequelize/dto";

async function seed() {
    const dbName = process.env.DB_NAME || "demo";
    const db = createSequelize(dbName);

    try {
        console.log(`[Seed] Connecting to database ${dbName}...`);
        await db.authenticate();
        console.log("[Seed] Database connected successfully.");

        // Init models
        initBrand(db);
        initCategory(db);
        initProduct(db);
        initUser(db);
        initCart(db);
        initOrder(db);


        // Sync tables if not exist
        await db.sync();

        console.log("[Seed] Cleaning existing mock data...");
        // Disable foreign key checks if any
        await db.query("SET FOREIGN_KEY_CHECKS = 0;");
        await OrderItemPersistence.destroy({ where: {}, truncate: true });
        await OrderPersistence.destroy({ where: {}, truncate: true });
        await CartPersistence.destroy({ where: {}, truncate: true });
        await ProductPersistence.destroy({ where: {}, truncate: true });
        await CategoryPersistence.destroy({ where: {}, truncate: true });
        await BrandPersistence.destroy({ where: {}, truncate: true });
        await UserPersistence.destroy({ where: {}, truncate: true });
        await db.query("SET FOREIGN_KEY_CHECKS = 1;");

        // 1. Seed Users (1 Admin, 1 User)
        console.log("[Seed] Seeding users...");
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync("Password123@", salt);

        const adminId = "a0000000-0000-4000-8000-000000000001";
        const userId = "b0000000-0000-4000-8000-000000000002";

        await UserPersistence.bulkCreate([
            {
                id: adminId,
                firstName: "System",
                lastName: "Admin",
                email: "admin@example.com",
                password: passwordHash,
                salt: salt,
                phone: "0901234567",
                address: "123 Le Loi, Ben Nghe, District 1, Ho Chi Minh",
                status: "active",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                gender: "male",
                role: "admin",
                birthday: new Date("1995-01-01"),
            },
            {
                id: userId,
                firstName: "Van A",
                lastName: "Nguyen",
                email: "user@example.com",
                password: passwordHash,
                salt: salt,
                phone: "0987654321",
                address: "456 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh",
                status: "active",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                gender: "male",
                role: "user",
                birthday: new Date("1998-05-15"),
            }
        ]);
        console.log("  -> Created 2 users: admin@example.com (admin), user@example.com (user)");

        // 2. Seed Brands
        console.log("[Seed] Seeding brands...");
        const brandNikeId = "10000000-0000-4000-8000-000000000001";
        const brandAdidasId = "10000000-0000-4000-8000-000000000002";
        const brandPumaId = "10000000-0000-4000-8000-000000000003";
        const brandAppleId = "10000000-0000-4000-8000-000000000004";
        const brandSamsungId = "10000000-0000-4000-8000-000000000005";

        await BrandPersistence.bulkCreate([
            {
                id: brandNikeId,
                name: "Nike",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                tagLine: "Just Do It",
                description: "Thương hiệu thể thao hàng đầu thế giới với các dòng giày và trang phục đẳng cấp.",
                status: "active",
            },
            {
                id: brandAdidasId,
                name: "Adidas",
                image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=300",
                tagLine: "Impossible is Nothing",
                description: "Thời trang thể thao và phong cách sống hiện đại, bền bỉ và thời thượng.",
                status: "active",
            },
            {
                id: brandPumaId,
                name: "Puma",
                image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300",
                tagLine: "Forever Faster",
                description: "Đột phá về tốc độ và phong cách thể thao đường phố cá tính.",
                status: "active",
            },
            {
                id: brandAppleId,
                name: "Apple",
                image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300",
                tagLine: "Think Different",
                description: "Thiết bị công nghệ cao cấp hàng đầu với thiết kế sang trọng và hiệu năng vượt trội.",
                status: "active",
            },
            {
                id: brandSamsungId,
                name: "Samsung",
                image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300",
                tagLine: "Inspire the World, Create the Future",
                description: "Tập đoàn công nghệ điện tử hàng đầu với các dòng sản phẩm đa dạng và thông minh.",
                status: "active",
            }
        ]);
        console.log("  -> Created 5 brands");

        // 3. Seed Categories
        console.log("[Seed] Seeding categories...");
        const catShoesId = "20000000-0000-4000-8000-000000000001";
        const catClothesId = "20000000-0000-4000-8000-000000000002";
        const catAccessoriesId = "20000000-0000-4000-8000-000000000003";
        const catElectronicsId = "20000000-0000-4000-8000-000000000004";

        await CategoryPersistence.bulkCreate([
            {
                id: catShoesId,
                name: "Giày Thể Thao",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                parentId: null,
                description: "Các dòng giày thể thao chạy bộ, tập gym và thời trang dạo phố.",
                position: 1,
                status: "active",
            },
            {
                id: catClothesId,
                name: "Quần Áo Thể Thao",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300",
                parentId: null,
                description: "Trang phục tập luyện, áo thun thoáng khí, quần jogger thể thao năng động.",
                position: 2,
                status: "active",
            },
            {
                id: catAccessoriesId,
                name: "Phụ Kiện Thời Trang",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
                parentId: null,
                description: "Balo, nón, tất thể thao và phụ kiện hỗ trợ tập luyện.",
                position: 3,
                status: "active",
            },
            {
                id: catElectronicsId,
                name: "Đồ Điện Tử & Công Nghệ",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                parentId: null,
                description: "Tai nghe thông minh, đồng hồ thể thao và phụ kiện công nghệ.",
                position: 4,
                status: "active",
            }
        ]);
        console.log("  -> Created 4 categories");

        // 4. Seed Products
        console.log("[Seed] Seeding products...");
        const prod1Id = "30000000-0000-4000-8000-000000000001";
        const prod2Id = "30000000-0000-4000-8000-000000000002";
        const prod3Id = "30000000-0000-4000-8000-000000000003";
        const prod4Id = "30000000-0000-4000-8000-000000000004";
        const prod5Id = "30000000-0000-4000-8000-000000000005";
        const prod6Id = "30000000-0000-4000-8000-000000000006";
        const prod7Id = "30000000-0000-4000-8000-000000000007";
        const prod8Id = "30000000-0000-4000-8000-000000000008";

        await ProductPersistence.bulkCreate([
            {
                id: prod1Id,
                name: "Giày Sneaker Nike Air Max 270",
                images: [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600"
                ],
                price: 3500000,
                salePrice: 2990000,
                colors: "Đỏ, Đen, Trắng",
                quantity: 50,
                brandId: brandNikeId,
                categoryId: catShoesId,
                description: "Thiết kế đệm khí Max Air lớn nhất ở gót chân mang lại cảm giác siêu êm ái cả ngày dài.",
                content: "Thân giày bằng vải dệt lưới thông thoáng, cổ giày ôm sát tạo độ linh hoạt khi di chuyển.",
                gender: "unisex",
                status: "active",
            },
            {
                id: prod2Id,
                name: "Giày Chạy Bộ Adidas Ultraboost Light",
                images: [
                    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600",
                    "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600"
                ],
                price: 4200000,
                salePrice: 3600000,
                colors: "Trắng, Xanh Navy",
                quantity: 40,
                brandId: brandAdidasId,
                categoryId: catShoesId,
                description: "Dòng giày chạy bộ công nghệ đệm Light Boost nhẹ hơn 30% giúp hoàn trả năng lượng tối ưu.",
                content: "Đế ngoài làm bằng cao su Continental bám đường chắc chắn trong mọi điều kiện thời tiết.",
                gender: "unisex",
                status: "active",
            },
            {
                id: prod3Id,
                name: "Áo Thun Thể Thao Nam Nike Pro Dri-FIT",
                images: [
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"
                ],
                price: 850000,
                salePrice: 690000,
                colors: "Đen, Xám",
                quantity: 100,
                brandId: brandNikeId,
                categoryId: catClothesId,
                description: "Áo ôm body co giãn 4 chiều hỗ trợ cơ bắp trong các bài tập gym cường độ cao.",
                content: "Công nghệ Dri-FIT hút ẩm và thoát mồ hôi cực nhanh giúp cơ thể luôn khô thoáng mát mẻ.",
                gender: "male",
                status: "active",
            },
            {
                id: prod4Id,
                name: "Quần Dài Nỉ Thể Thao Adidas Tiro 23",
                images: [
                    "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600"
                ],
                price: 1200000,
                salePrice: 990000,
                colors: "Đen Sọc Trắng",
                quantity: 60,
                brandId: brandAdidasId,
                categoryId: catClothesId,
                description: "Chiếc quần kinh điển của Adidas với 3 sọc dọc thân quần và khóa zip ở mắt cá chân.",
                content: "Chất vải thun nỉ tái chế cao cấp, mềm mại và chống nhăn hiệu quả.",
                gender: "unisex",
                status: "active",
            },
            {
                id: prod5Id,
                name: "Balo Thể Thao Puma Phase Backpack",
                images: [
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
                ],
                price: 650000,
                salePrice: 490000,
                colors: "Đen, Xanh Dương",
                quantity: 80,
                brandId: brandPumaId,
                categoryId: catAccessoriesId,
                description: "Balo kích thước tiêu chuẩn 22L có ngăn chứa laptop và các ngăn phụ tiện dụng.",
                content: "Chất liệu polyester bền bỉ chống thấm nước nhẹ, quai đeo êm ái.",
                gender: "unisex",
                status: "active",
            },
            {
                id: prod6Id,
                name: "Tai Nghe Không Dây Apple AirPods Pro 2",
                images: [
                    "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600"
                ],
                price: 5990000,
                salePrice: 5290000,
                colors: "Trắng",
                quantity: 30,
                brandId: brandAppleId,
                categoryId: catElectronicsId,
                description: "Công nghệ khử tiếng ồn chủ động ANC thế hệ mới gấp 2 lần và âm thanh không gian Spatial Audio.",
                content: "Thời lượng pin lên đến 30 giờ kèm hộp sạc MagSafe tiện lợi.",
                gender: "unisex",
                status: "active",
            },
            {
                id: prod7Id,
                name: "Đồng Hồ Thông Minh Samsung Galaxy Watch 6",
                images: [
                    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"
                ],
                price: 6990000,
                salePrice: 5990000,
                colors: "Đen, Bạc",
                quantity: 25,
                brandId: brandSamsungId,
                categoryId: catElectronicsId,
                description: "Theo dõi chỉ số sức khỏe, nhịp tim, giấc ngủ và đo thành phần cơ thể BIA chuẩn xác.",
                content: "Màn hình Sapphire chống trầy xước và viền bezel mỏng tinh tế.",
                gender: "unisex",
                status: "active",
            },
            {
                id: prod8Id,
                name: "Nón Lưỡi Trai Nike Heritage86",
                images: [
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"
                ],
                price: 450000,
                salePrice: 390000,
                colors: "Đen, Trắng",
                quantity: 120,
                brandId: brandNikeId,
                categoryId: catAccessoriesId,
                description: "Nón lưỡi trai chất liệu cotton twill mềm mại, khóa cài phía sau dễ dàng điều chỉnh.",
                content: "Logo Nike Futura thêu nổi bật phía trước tạo phong cách năng động.",
                gender: "unisex",
                status: "active",
            }
        ]);
        console.log("  -> Created 8 products");

        // 5. Seed Cart
        console.log("[Seed] Seeding carts...");
        await CartPersistence.bulkCreate([
            {
                id: "40000000-0000-4000-8000-000000000001",
                userId: userId,
                productId: prod1Id,
                attribute: "Size: 42, Color: Đen",
                quantity: 1
            },
            {
                id: "40000000-0000-4000-8000-000000000002",
                userId: userId,
                productId: prod3Id,
                attribute: "Size: L, Color: Đen",
                quantity: 2
            }
        ]);
        console.log("  -> Created 2 cart items for user");

        // 6. Seed Orders & Order Items
        console.log("[Seed] Seeding orders and order items...");
        const order1Id = "50000000-0000-4000-8000-000000000001";
        const order2Id = "50000000-0000-4000-8000-000000000002";

        await OrderPersistence.bulkCreate([
            {
                id: order1Id,
                user_id: userId,
                shipping_address: "456 Nguyen Hue, Ben Nghe, Quan 1",
                shipping_city: "TP. Hồ Chí Minh",
                shipping_method: "standard",
                payment_method: "cod",
                payment_status: "pending",
                recipient_first_name: "Van A",
                recipient_last_name: "Nguyen",
                recipient_phone: "0987654321",
                recipient_email: "user@example.com",
                tracking_number: "TRACK89218291",
                status: "shipping"
            },
            {
                id: order2Id,
                user_id: userId,
                shipping_address: "123 Le Loi, Ben Nghe, Quan 1",
                shipping_city: "TP. Hồ Chí Minh",
                shipping_method: "free",
                payment_method: "zalo",
                payment_status: "paid",
                recipient_first_name: "Van A",
                recipient_last_name: "Nguyen",
                recipient_phone: "0987654321",
                recipient_email: "user@example.com",
                tracking_number: "TRACK99882211",
                status: "delivered"
            }
        ]);

        await OrderItemPersistence.bulkCreate([
            {
                id: "60000000-0000-4000-8000-000000000001",
                order_id: order1Id,
                product_id: prod1Id,
                attribute: "Size: 42, Color: Đen",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                name: "Giày Sneaker Nike Air Max 270",
                quantity: 1,
                price: 2990000
            },
            {
                id: "60000000-0000-4000-8000-000000000002",
                order_id: order1Id,
                product_id: prod3Id,
                attribute: "Size: L, Color: Đen",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
                name: "Áo Thun Thể Thao Nam Nike Pro Dri-FIT",
                quantity: 1,
                price: 690000
            },
            {
                id: "60000000-0000-4000-8000-000000000003",
                order_id: order2Id,
                product_id: prod6Id,
                attribute: "Standard, Color: Trắng",
                image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600",
                name: "Tai Nghe Không Dây Apple AirPods Pro 2",
                quantity: 1,
                price: 5290000
            }
        ]);
        console.log("  -> Created 2 orders and 3 order items");

        console.log("\n=======================================================");
        console.log("   DATA SEEDING COMPLETED SUCCESSFULLY!");
        console.log("=======================================================");
        console.log("Users created:");
        console.log("1. Admin: admin@example.com | Password: Password123@ (Role: admin)");
        console.log("2. User:  user@example.com  | Password: Password123@ (Role: user)");
        console.log("=======================================================\n");

        await db.close();
        process.exit(0);
    } catch (error) {
        console.error("Database seeding failed:", error);
        await db.close();
        process.exit(1);
    }
}

seed();
