import { config } from "dotenv";
config();

import { createSequelize } from "../src/share/component/sequelize";
import { init as initBrand } from "../src/modules/brand/infras/repository/sequelize/dto";
import { init as initCategory } from "../src/modules/category/infras/repository/dto";
import { init as initProduct } from "../src/modules/product/insfra/repository/mysql/dto";
import { init as initUser } from "../src/modules/user/infras/repository/mysql/dto";
import { init as initCart } from "../src/modules/cart/infras/repository/dto";
import { init as initOrder } from "../src/modules/orders/infras/repository/sequelize/dto";
import { init as initOrderItem } from "../src/modules/order_items/infras/repository/sequelize/dto";

async function migrate() {
    const dbName = process.env.DB_NAME || "databasemysql";
    const db = createSequelize(dbName);

    try {
        console.log(`Connecting to RDS MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}...`);
        await db.authenticate();
        console.log(`✅ Successfully connected to database: ${dbName}`);

        console.log("Initializing model schemas...");
        initBrand(db);
        initCategory(db);
        initProduct(db);
        initUser(db);
        initCart(db);
        initOrder(db);
        initOrderItem(db);

        console.log("Creating and synchronizing tables on AWS RDS MySQL...");
        await db.sync({ alter: true });

        console.log("🎉 All tables synchronized successfully:");
        console.log(" - brands");
        console.log(" - categories");
        console.log(" - products");
        console.log(" - users");
        console.log(" - carts");
        console.log(" - orders");
        console.log(" - order_items");

        await db.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Database migration failed:", error);
        process.exit(1);
    }
}

migrate();

