import { Request, Response } from "express";
import { CartCondDTOSchema, CartCreateSchema, CartUpdateSchema } from "../../model/dto";
import { ICartUseCase } from "../../interface";
import { PagingDTOSchema } from "../../../../share/model/paging";

export class CartHttpServiceAPI {
    constructor(private readonly useCase: ICartUseCase) { }

    async createCartItemAPI(req: Request, res: Response) {
        const { success, data, error } = CartCreateSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }
        const result = await this.useCase.createCartItem(data);
        res.status(201).json({
            data: result
        });
    }

    async getCartItemAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid cart item id"
            });
        }

        const result = await this.useCase.getCartItem(id);
        res.status(200).json({
            data: result
        });
    }

    async updateCartItemAPI(req: Request, res: Response) {
        const { id } = req.params;
        const { success, data, error } = CartUpdateSchema.safeParse(req.body);

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid cart item id"
            });
        }

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }

        const result = await this.useCase.updateCartItem(id, data);
        res.status(200).json({
            data: result
        });
    }

    async deleteCartItemAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid cart item id"
            });
        }

        const result = await this.useCase.deleteCartItem(id);
        res.status(200).json({
            data: result
        });
    }

    async listCartItemsAPI(req: Request, res: Response) {
        const pagingResult = PagingDTOSchema.safeParse(req.query);

        if (!pagingResult.success) {
            return res.status(400).json({
                error: pagingResult.error.message
            });
        }

        const condResult = CartCondDTOSchema.safeParse(req.query);
        if (!condResult.success) {
            return res.status(400).json({
                error: condResult.error.message
            });
        }

        const paging = pagingResult.data;
        const cond = condResult.data;
        const result = await this.useCase.listCartItems(cond, paging);

        res.status(200).json({
            data: result,
            paging,
            filter: cond
        });
    }
}