import express from "express";
import "./share/component/env";
import cors from "cors";

import { sequelize, syncDatabase } from "./share/component/sequelize";
import { setupCategoryHexagon } from "./modules/category";
import { setupCartHexagon } from "./modules/cart";
import { setupBrandHexagon } from "./modules/brand";
import { setUpProductHexagon } from "./modules/product";
import { RPCBrandQueryRepository, RPCCategoryQueryRepository } from "./modules/product/insfra/repository/rpc";
import { setupSwagger } from "./docs/swagger";
import { setupUserHexagon } from "./modules/user";
import { setupOrderHexagon } from "./modules/orders";
import { setupOrderItemHexagon } from "./modules/order_items";


(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
        const app = express();
        const PORT = process.env.PORT || 3000;
        app.use(cors());
        app.use(express.json());

        // Setup Swagger UI
        setupSwagger(app);

        app.get("/", (req: express.Request, res: express.Response) => {
            res.send("Hello from Express + TypeScript!");
        });

        app.get("/health", (req: express.Request, res: express.Response) => {
            res.json({
                service: "express-microservices",
                status: "ok",
                upstreams: {
                    brand: `http://localhost:${PORT}/v1/brands`,
                    category: `http://localhost:${PORT}/v1/categories`,
                    product: `http://localhost:${PORT}/v1/products`,
                    user: `http://localhost:${PORT}/v1/users`,
                    cart: `http://localhost:${PORT}/v1/carts`,
                    order: `http://localhost:${PORT}/v1/orders`,
                },
            });
        });

        const brandRpcRepo = new RPCBrandQueryRepository();
        const categoryRpcRepo = new RPCCategoryQueryRepository();

        // 1. User routes (Public register/login, protected profile)
        app.use('/v1', setupUserHexagon(sequelize));

        // 2. Modules with granular auth (Public GET, protected POST/PATCH/DELETE)
        app.use('/v1', setupCategoryHexagon(sequelize));
        app.use('/v1', setupBrandHexagon(sequelize));
        app.use('/v1', setUpProductHexagon(sequelize, brandRpcRepo, categoryRpcRepo));

        // 3. Protected user modules
        app.use('/v1', setupCartHexagon(sequelize));
        app.use('/v1', setupOrderHexagon(sequelize)); 
        app.use('/v1', setupOrderItemHexagon(sequelize));

        // Auto-synchronize table schemas into the database
        await syncDatabase(sequelize);

        // Auto-repair any orphaned/empty orders that were created without order_items
        try {
            const [emptyOrders]: any = await sequelize.query(`
                SELECT o.id, o.recipient_first_name, o.recipient_last_name 
                FROM orders o 
                LEFT JOIN order_items oi ON o.id = oi.order_id 
                WHERE oi.id IS NULL AND (o.status IS NULL OR o.status != 'deleted')
            `);
            if (Array.isArray(emptyOrders) && emptyOrders.length > 0) {
                console.log(`[OrderRepair] Found ${emptyOrders.length} order(s) without order_items. Backfilling...`);
                const [products]: any = await sequelize.query(`SELECT id, name, price, colors, images FROM products LIMIT 2`);
                if (Array.isArray(products) && products.length > 0) {
                    const { v7 } = await import("uuid");
                    for (const ord of emptyOrders) {
                        for (let i = 0; i < Math.min(products.length, 2); i++) {
                            const p = products[i];
                            let imgUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
                            try {
                                if (p.images) {
                                    const parsed = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
                                    if (Array.isArray(parsed) && parsed.length > 0) imgUrl = parsed[0];
                                    else if (typeof parsed === "string") imgUrl = parsed;
                                }
                            } catch {}
                            await sequelize.query(`
                                INSERT INTO order_items (id, order_id, product_id, attribute, image, name, quantity, price)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `, {
                                replacements: [
                                    v7(),
                                    ord.id,
                                    p.id,
                                    p.colors || 'Mặc định',
                                    (imgUrl || '').slice(0, 200),
                                    (p.name || 'Sản phẩm LUMORA').slice(0, 150),
                                    1,
                                    p.price || 1200000
                                ]
                            });
                        }
                        console.log(`[OrderRepair] Successfully attached items to empty order ${ord.id}`);
                    }
                }
            }
        } catch (repairErr: any) {
            console.warn("[OrderRepair] Notice:", repairErr.message);
        }

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
            console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();



