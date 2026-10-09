import { Request, Response } from "express";
import type { ProductRatingUseCase } from "../../usecase";
import {
    CreateProductRatingDTOSchema,
    UpdateProductRatingDTOSchema,
} from "../../model/dto";
import { PagingDTOSchema } from "../../../../share/model/paging";

export class ProductRatingQueryHTTPServiceAPI {
    constructor(
        private readonly productRatingUseCase: ProductRatingUseCase,
    ) {}

    async listProductRatingsAPI(req: Request, res: Response) {
        const { success, data, error } = PagingDTOSchema.safeParse(req.query);

        if (!success) {
            return res.status(400).json({
                error: error.message,
            });
        }

        const productId = req.query.productId as string | undefined;
        const userId = req.query.userId as string | undefined;

        if (productId) {
            const result = await this.productRatingUseCase.findByProductId(
                productId,
                data,
            );

            return res.status(200).json({
                data: result,
                paging: data,
            });
        }

        if (userId) {
            const result = await this.productRatingUseCase.findByUserId(
                userId,
                data,
            );

            return res.status(200).json({
                data: result,
                paging: data,
            });
        }

        return res.status(400).json({
            error: "Either productId or userId must be provided",
        });
    }

    async getProductRatingDetailAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid product rating id",
            });
        }

        const result = await this.productRatingUseCase.findById(id);

        return res.status(200).json({
            data: result,
        });
    }
}

export class ProductRatingCommandHTTPServiceAPI {
    constructor(
        private readonly productRatingUseCase: ProductRatingUseCase,
    ) {}

    async createProductRatingAPI(req: Request, res: Response) {
        const { success, data, error } =
            CreateProductRatingDTOSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                error: error.message,
            });
        }

        // Giả định middleware xác thực đã gắn user vào req.
        const userId = (req as Request & {
            user?: { id: string };
        }).user?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        const result = await this.productRatingUseCase.create(userId, data);

        return res.status(201).json({
            data: result,
        });
    }

    async updateProductRatingAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid product rating id",
            });
        }

        const { success, data, error } =
            UpdateProductRatingDTOSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                error: error.message,
            });
        }

        const userId = (req as Request & {
            user?: { id: string };
        }).user?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        const result = await this.productRatingUseCase.update(
            id,
            userId,
            data,
        );

        return res.status(200).json({
            data: result,
        });
    }

    async deleteProductRatingAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid product rating id",
            });
        }

        const userId = (req as Request & {
            user?: { id: string };
        }).user?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        await this.productRatingUseCase.delete(id, userId);

        return res.status(200).json({
            data: true,
        });
    }
}