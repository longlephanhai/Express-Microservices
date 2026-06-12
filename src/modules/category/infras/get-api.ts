import { Request, Response } from "express";
import { CategoryPersistence } from "./repository/dto";
import { CategoryStatus } from "../model/model";

export const getCategoryApi = async (req: Request, res: Response) => {

    const { id } = req.params as { id: string };

    const category = await CategoryPersistence.findByPk(id);

    if (!category || category.status === CategoryStatus.Deleted) {
        return res.status(404).json({
            message: "Category not found"
        });
    }

    res.status(200).json({
        data: category
    });
}