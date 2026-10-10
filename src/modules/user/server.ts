import express from "express";
import { config } from "dotenv";
import { createSequelize } from "../../share/component/sequelize";
import { setupUserHexagon } from "./index";

config();

const PORT = process.env.USER_PORT || 3004;
const DB_NAME = process.env.DB_USER_NAME || process.env.DB_NAME;

(async () => {
    try {
        const db = createSequelize(DB_NAME);
        await db.authenticate();
        console.log(`[User Service] Database connected successfully (${DB_NAME}).`);

        const app = express();
        app.use(express.json());

        app.get("/health", (req, res) => {
            res.json({ service: "user-service", status: "ok" });
        });

        app.use("/v1", setupUserHexagon(db));

        app.listen(PORT, () => {
            console.log(`[User Service] Running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[User Service] Failed to start:", error);
    }
})();

