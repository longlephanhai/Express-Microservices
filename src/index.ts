import express from "express";
import { config } from "dotenv";

import { sequelize } from "./share/component/sequelize";
import { setupCategoryHexagon } from "./modules/category";
import { setupCartHexagon } from "./modules/cart";
import { setupBrandHexagon } from "./modules/brand";
import { setUpProductHexagon } from "./modules/product";
import { RPCBrandQueryRepository, RPCCategoryQueryRepository } from "./modules/product/insfra/repository/rpc";
import { setupSwagger } from "./docs/swagger";
import { setupUserHexagon } from "./modules/user";

config();


(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
        const app = express();
        const PORT = process.env.PORT || 3000;
        app.use(express.json());

        // Setup Swagger UI
        setupSwagger(app);

        app.get("/", (req: express.Request, res: express.Response) => {
            res.send("Hello from Express + TypeScript!");
        });

        const brandRpcRepo = new RPCBrandQueryRepository();
        const categoryRpcRepo = new RPCCategoryQueryRepository();

        app.use('/v1', setupCategoryHexagon(sequelize));
        app.use('/v1', setupCartHexagon(sequelize));
        app.use('/v1', setupBrandHexagon(sequelize));
        app.use('/v1', setUpProductHexagon(sequelize, brandRpcRepo, categoryRpcRepo));
        app.use('/v1', setupUserHexagon(sequelize));

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
            console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();



