import { Request, Response } from "express";
import { CategoryUpdateSchema } from "../model/dto";
import { CategoryPersistence } from "./repository/dto";
import { CategoryStatus } from "../model/model";

export const updateCategoryApi = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const { success, data, error } = CategoryUpdateSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            error: error.message
        })
    }

    const category = await CategoryPersistence.findByPk(id);

    if (!category || category.status === CategoryStatus.Deleted) {
        return res.status(404).json({
            error: "Category not found"
        });
    }

    await CategoryPersistence.update(data, {
        where: {
            id: id,
        }
    });



    res.status(200).json({
        data: true,
    });
}