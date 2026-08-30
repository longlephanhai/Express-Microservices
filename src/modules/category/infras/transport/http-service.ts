import { Request, Response } from "express";
import { CategoryCondDTOSchema, CategoryCreateSchema } from "../../model/dto";
import { ICategoryUseCase } from "../../interface";
import { PagingDTOSchema } from "../../../../share/model/paging";

export class CategoryHttpServiceAPI {
    constructor(private readonly useCase: ICategoryUseCase) { }

    async createNewCategoryAPI(req: Request, res: Response) {
        const { success, data, error } = CategoryCreateSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }
        const result = await this.useCase.createNewCategory(data);
        res.status(201).json({
            data: result
        });
    }

    async getDetailCategoryAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        const result = await this.useCase.getDetailCategory(id);
        res.status(200).json({
            data: result
        });
    }

    async updateCategoryAPI(req: Request, res: Response) {
        const { id } = req.params;
        const { success, data, error } = CategoryCreateSchema.safeParse(req.body);

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }

        const result = await this.useCase.updateCategory(id, data);
        res.status(200).json({
            data: result
        });
    }

    async deleteCategoryAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        const result = await this.useCase.deleteCategory(id);
        res.status(200).json({
            data: result
        });
    }

    async listCategoriesAPI(req: Request, res: Response) {
        const { success, data: paging, error } = PagingDTOSchema.safeParse(req.query);

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }

        const cond = CategoryCondDTOSchema.parse(req.query);
        const result = await this.useCase.listCategories(cond, paging);
        res.status(200).json({
            data: result,
            paging,
            filter: cond
        });
    }
}