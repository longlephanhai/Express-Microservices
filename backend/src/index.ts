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
import { authMiddleware } from "./share/middleware/auth";


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

        const brandRpcRepo = new RPCBrandQueryRepository();
        const categoryRpcRepo = new RPCCategoryQueryRepository();

        // 1. Public Authentication routes (/v1/auth/register, /v1/auth/login)
        app.use('/v1', setupUserHexagon(sequelize));

        // 2. Authentication Middleware - protects all subsequent /v1 endpoints
        app.use('/v1', authMiddleware);

        // 3. Protected routes requiring valid Bearer Token
        app.use('/v1', setupCategoryHexagon(sequelize));
        app.use('/v1', setupCartHexagon(sequelize));
        app.use('/v1', setupBrandHexagon(sequelize));
        app.use('/v1', setUpProductHexagon(sequelize, brandRpcRepo, categoryRpcRepo));
        app.use('/v1', setupOrderHexagon(sequelize)); 
        app.use('/v1', setupOrderItemHexagon(sequelize));

        // Auto-synchronize table schemas into the database
        await syncDatabase(sequelize);

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
            console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();



