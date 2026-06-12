import { Request, Response } from "express";
import { CategoryPersistence } from "./repository/dto";
import { CategoryStatus } from "../model/model";

export const deleteCategoryApi = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const category = await CategoryPersistence.findByPk(id);

    if (!category) {
        return res.status(404).json({
            error: "Category not found"
        });
    }

    if (category.status === CategoryStatus.Deleted) {
        return res.status(404).json({
            error: "Category already deleted"
        });
    }

    await CategoryPersistence.update({
        status: CategoryStatus.Deleted,
    }, {
        where: {
            id: id,
        }
    })

    res.status(200).json({
        data: true,
    });
}