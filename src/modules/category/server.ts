import express from "express";
import { config } from "dotenv";
import { createSequelize } from "../../share/component/sequelize";
import { setupCategoryHexagon } from "./index";

config();

const PORT = process.env.CATEGORY_PORT || 3002;
const DB_NAME = process.env.DB_CATEGORY_NAME || process.env.DB_NAME;

(async () => {
    try {
        const db = createSequelize(DB_NAME);
        await db.authenticate();
        console.log(`[Category Service] Database connected successfully (${DB_NAME}).`);

        const app = express();
        app.use(express.json());

        app.get("/health", (req, res) => {
            res.json({ service: "category-service", status: "ok" });
        });

        app.use("/v1", setupCategoryHexagon(db));

        app.listen(PORT, () => {
            console.log(`[Category Service] Running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[Category Service] Failed to start:", error);
    }
})();
