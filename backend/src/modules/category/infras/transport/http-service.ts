import { Request, Response } from "express";
import { CategoryCondDTOSchema, CategoryCreateSchema } from "../../model/dto";
import { ICategoryUseCase } from "../../interface";
import { PagingDTOSchema } from "../../../../share/model/paging";
import { Category } from "../../model/model";

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
        // const { success, data: paging, error } = PagingDTOSchema.safeParse(req.query);

        // if (!success) {
        //     return res.status(400).json({
        //         error: error.message
        //     });
        // }

        const paging = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20
        };

        const cond = CategoryCondDTOSchema.parse(req.query);
        const result = await this.useCase.listCategories(cond, paging);

        const categoriesTree: Category[] = [];
        const mapChildren = new Map<string, Category[]>();

        for (const category of result) {
            if (!category) {
                continue;
            }

            if (!mapChildren.get(category.id)) {
                mapChildren.set(category.id, []);
            }

            category.children = mapChildren.get(category.id) ?? [];

            if (!category.parentId) {
                categoriesTree.push(category);
            } else {
                const children = mapChildren.get(category.parentId) ?? [];
                children ? children.push(category) : mapChildren.set(category.parentId, [category]);
            }
        }

        res.status(200).json({
            data: result,
            paging,
            filter: cond
        });
    }
}