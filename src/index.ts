import express from "express";
import { config } from "dotenv";
import { setupCategoryModule } from "./modules/category";
import { sequelize } from "./share/component/sequelize";

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

        app.use('/v1', setupCategoryModule(sequelize));



        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();



