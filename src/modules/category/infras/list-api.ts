import { Request, Response } from "express";
import { CategoryPersistence } from "./repository/dto";
import z from "zod";
import { where } from "sequelize";

const PagingDTOSchema = z.object({
    page: z.coerce.number().int().min(1).default(1), // (coerce) cho phep auto cast tu string sang number 
    limit: z.coerce.number().int().min(1).max(100).default(10),
    total: z.coerce.number().int().min(0).default(0).optional(),
});

type PagingDTO = z.infer<typeof PagingDTOSchema>;

export const listCategoryApi = async (req: Request, res: Response) => {
    const { success, data } = PagingDTOSchema.safeParse(req.query)

    if (!success) {
        return res.status(400).json({
            error: "Invalid query parameters"
        });
    }

    const { page, limit } = data as PagingDTO;

    const { rows, count } = await CategoryPersistence.findAndCountAll({
        limit: limit,
        offset: (page - 1) * limit,
        where: {
            status: 'active'
        }
    })

    data.total = count;

    res.status(200).json({
        data: rows,
        paging: data,
    });
}