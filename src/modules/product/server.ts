import express from "express";
import { config } from "dotenv";
import { createSequelize } from "../../share/component/sequelize";
import { setUpProductHexagon } from "./index";
import { RPCBrandQueryRepository, RPCCategoryQueryRepository } from "./insfra/repository/rpc";

config();

const PORT = process.env.PRODUCT_PORT || 3003;
const DB_NAME = process.env.DB_PRODUCT_NAME || process.env.DB_NAME;
const BRAND_SERVICE_URL = process.env.BRAND_SERVICE_URL || "http://localhost:3001";
const CATEGORY_SERVICE_URL = process.env.CATEGORY_SERVICE_URL || "http://localhost:3002";

(async () => {
    try {
        const db = createSequelize(DB_NAME);
        await db.authenticate();
        console.log(`[Product Service] Database connected successfully (${DB_NAME}).`);

        const app = express();
        app.use(express.json());

        app.get("/health", (req, res) => {
            res.json({ service: "product-service", status: "ok" });
        });

        const brandRpcRepo = new RPCBrandQueryRepository(BRAND_SERVICE_URL);
        const categoryRpcRepo = new RPCCategoryQueryRepository(CATEGORY_SERVICE_URL);

        app.use("/v1", setUpProductHexagon(db, brandRpcRepo, categoryRpcRepo));

        app.listen(PORT, () => {
            console.log(`[Product Service] Running at http://localhost:${PORT}`);
            console.log(`[Product Service] RPC Brand Target: ${BRAND_SERVICE_URL}`);
            console.log(`[Product Service] RPC Category Target: ${CATEGORY_SERVICE_URL}`);
        });
    } catch (error) {
        console.error("[Product Service] Failed to start:", error);
    }
})();
