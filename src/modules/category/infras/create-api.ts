import { Request, Response } from "express";
import { CategoryCreateSchema } from "../model/dto";
import { CategoryPersistence } from "./repository/dto";
import { v7 } from "uuid";

export const createCategory = async (req: Request, res: Response) => {
    const { success, data, error } = CategoryCreateSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            error: error.message
        });
    }

    const newId = v7()
    await CategoryPersistence.create({
        id: newId,
        ...data
    });

    res.status(200).json({
        data: newId
    });
}