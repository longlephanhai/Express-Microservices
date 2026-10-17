import express, { Request, Response } from "express";
import "../share/component/env";
import cors from "cors";
import axios, { AxiosResponse } from "axios";
import { setupSwagger } from "../docs/swagger";

import { authMiddleware } from "../share/middleware/auth";

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

const BRAND_SERVICE_URL = process.env.BRAND_SERVICE_URL || "http://localhost:3001";
const CATEGORY_SERVICE_URL = process.env.CATEGORY_SERVICE_URL || "http://localhost:3002";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3003";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3004";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:3005";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:3006";

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.get("/health", (req: Request, res: Response) => {
    res.json({
        service: "api-gateway",
        status: "ok",
        upstreams: {
            brand: BRAND_SERVICE_URL,
            category: CATEGORY_SERVICE_URL,
            product: PRODUCT_SERVICE_URL,
            user: USER_SERVICE_URL,
            cart: CART_SERVICE_URL,
            order: ORDER_SERVICE_URL
        },
    });
});

function createServiceProxy(targetBaseUrl: string) {
    return async (req: Request, res: Response) => {
        const targetUrl = `${targetBaseUrl}${req.originalUrl}`;
        const headers: Record<string, any> = { ...req.headers };
        delete headers["host"];
        delete headers["content-length"];

        if (req.userId) {
            headers["x-user-id"] = req.userId;
            headers["x-user-role"] = req.userRole || "user";
        }

        try {
            const response: AxiosResponse = await axios({
                method: req.method,
                url: targetUrl,
                data: req.body,
                headers,
                validateStatus: () => true,
            });

            res.status(response.status);

            const contentType = response.headers["content-type"];
            if (typeof contentType === "string") {
                res.setHeader("content-type", contentType);
            }

            res.send(response.data);
        } catch (error: any) {
            console.error(`[API Gateway] Error proxying to ${targetUrl}:`, error.message);
            res.status(502).json({
                message: `Bad Gateway: Unable to connect to upstream service at ${targetBaseUrl}`,
                error: error.message,
            });
        }
    };
}

// 1. Public Authentication routes (/v1/auth/register, /v1/auth/login)
app.use("/v1/auth", createServiceProxy(USER_SERVICE_URL));

// 2. All other routes require authMiddleware
app.use("/v1/brands", createServiceProxy(BRAND_SERVICE_URL));
app.use("/v1/categories", createServiceProxy(CATEGORY_SERVICE_URL));
app.use("/v1/products", createServiceProxy(PRODUCT_SERVICE_URL));
app.use("/v1/users", createServiceProxy(USER_SERVICE_URL));
app.use("/v1/carts", createServiceProxy(CART_SERVICE_URL));
app.use("/v1/orders", createServiceProxy(ORDER_SERVICE_URL));
app.use("/v1/order-items", createServiceProxy(ORDER_SERVICE_URL));

app.get("/", (req: Request, res: Response) => {
    res.send("API Gateway is running. Swagger Docs available at /api-docs");
});

app.listen(PORT, () => {
    console.log(`[API Gateway] Running at http://localhost:${PORT}`);
    console.log(`[API Gateway] Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(`[API Gateway] Routes:`);
    console.log(`  - /v1/brands      -> ${BRAND_SERVICE_URL}`);
    console.log(`  - /v1/categories  -> ${CATEGORY_SERVICE_URL}`);
    console.log(`  - /v1/products    -> ${PRODUCT_SERVICE_URL}`);
    console.log(`  - /v1/auth        -> ${USER_SERVICE_URL}`);
    console.log(`  - /v1/users       -> ${USER_SERVICE_URL}`);
});
