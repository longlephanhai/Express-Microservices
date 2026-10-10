import express from "express";
import { config } from "dotenv";
import { createSequelize } from "../../share/component/sequelize";
import { setupOrderHexagon } from ".";


config();

const PORT = process.env.ORDER_PORT || 3006;
const DB_NAME = process.env.DB_ORDER_NAME || process.env.DB_NAME;

(async () => {
    try {
        const db = createSequelize(DB_NAME);
        await db.authenticate();
        console.log(`[Cart Service] Database connected successfully (${DB_NAME}).`);

        const app = express();
        app.use(express.json());

        app.get("/health", (req, res) => {
            res.json({ service: "cart-service", status: "ok" });
        });

        app.use("/v1", setupOrderHexagon(db));

        app.listen(PORT, () => {
            console.log(`[Cart Service] Running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[Cart Service] Failed to start:", error);
    }
})();
