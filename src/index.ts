import express from "express";
import { config } from "dotenv";

import { sequelize } from "./share/component/sequelize";
import { setupCategoryHexagon } from "./modules/category";
import { setupBrandHexagon } from "./modules/brand";
import { setupImagesHexagon } from "./modules/images";

config();


(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
        const app = express();
        const PORT = process.env.PORT || 3000;
        app.use(express.json());

        app.get("/", (req: express.Request, res: express.Response) => {
            res.send("Hello from Express + TypeScript!");
        });

        app.use('/v1', setupCategoryHexagon(sequelize));
        app.use('/v1', setupBrandHexagon(sequelize));
        app.use('/v1', setupImagesHexagon(sequelize));



        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();



