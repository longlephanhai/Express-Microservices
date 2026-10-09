import express from "express";
import { config } from "dotenv";

import { sequelize } from "./share/component/sequelize";
import { setupCategoryHexagon } from "./modules/category";
import { setupBrandHexagon } from "./modules/brand";
import { setUpProductHexagon } from "./modules/product";
import { setupSwagger } from "./docs/swagger";
import { setupOrderHexagon } from "./modules/orders";
import { setupOrderItemHexagon } from "./modules/order_items";

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

        app.use('/v1', setupCategoryHexagon(sequelize));
        app.use('/v1', setupBrandHexagon(sequelize));
        app.use('/v1', setUpProductHexagon(sequelize));

        // Setup Orders modules
        app.use('/v1', setupOrderHexagon(sequelize)); 
        app.use('/v1', setupOrderItemHexagon(sequelize));

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
            console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();



