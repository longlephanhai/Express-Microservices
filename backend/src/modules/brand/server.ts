import express from "express";
import { config } from "dotenv";
import { createSequelize } from "../../share/component/sequelize";
import { setupBrandHexagon } from "./index";

config();

const PORT = process.env.BRAND_PORT || 3001;
const DB_NAME = process.env.DB_BRAND_NAME || process.env.DB_NAME;

(async () => {
    try {
        const db = createSequelize(DB_NAME);
        await db.authenticate();
        console.log(`[Brand Service] Database connected successfully (${DB_NAME}).`);

        const app = express();
        app.use(express.json());

        app.get("/health", (req, res) => {
            res.json({ service: "brand-service", status: "ok" });
        });

        app.use("/v1", setupBrandHexagon(db));

        app.listen(PORT, () => {
            console.log(`[Brand Service] Running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[Brand Service] Failed to start:", error);
    }
})();
