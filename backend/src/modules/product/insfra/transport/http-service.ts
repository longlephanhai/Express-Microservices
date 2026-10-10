import { Request, Response } from "express";
import { IProductCommandUseCase, IProductQueryUseCase } from "../../interface";
import { ProductCondSchema, ProductCreateSchema, ProductUpdateSchema } from "../../model/dto";


export class ProductQueryHTTPServiceAPI {
    constructor(
        private readonly productQueryUseCase: IProductQueryUseCase,
    ) { }

    async listProductsAPI(req: Request, res: Response) {
        const paging = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10
        }

        const cond = ProductCondSchema.parse(req.query);
        const result = await this.productQueryUseCase.listProducts(cond, paging);
        res.status(200).json({
            data: result,
            paging,
            filter: cond
        });
    }

    async getDetailProductAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid product id"
            });
        }

        const result = await this.productQueryUseCase.getDetailProduct(id);
        res.status(200).json({
            data: result
        });
    }

}

export class ProductCommandHTTPServiceAPI {
    constructor(
        private readonly productCommandUseCase: IProductCommandUseCase,
    ) { }

    async createNewProductAPI(req: Request, res: Response) {
        const { success, data, error } = ProductCreateSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }

        const result = await this.productCommandUseCase.createNewProduct(data);
        res.status(200).json({
            data: result
        });
    }

    async updateProductAPI(req: Request, res: Response) {
        const { id } = req.params;
        const { success, data, error } = ProductUpdateSchema.safeParse(req.body);


        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid product id"
            });
        }

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }

        const result = await this.productCommandUseCase.updateProduct(id, data);
        res.status(200).json({
            data: result
        });
    }

    async deleteProductAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid product id"
            });
        }

        const result = await this.productCommandUseCase.deleteProduct(id);
        res.status(200).json({
            data: result
        });
    }
}