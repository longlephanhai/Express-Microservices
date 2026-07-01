import { Request, Response } from "express";
import { CategoryPersistence } from "./repository/dto";
import { PagingDTO, PagingDTOSchema } from "../../../share/model/paging";



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