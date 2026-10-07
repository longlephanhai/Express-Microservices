
import { Request, Response } from "express";
import { GetDetailQuery, IBrandUseCase, UpdateCommand } from "../../../interface";
import { BrandCreateDTO, BrandUpdateDTOSchema } from "../../../model/dto";
import { Brand } from "../../../model/brand";
import { ICommandHandler, IQueryHandler } from "../../../../../share/interface";



export class BrandHttpServiceAPI {
    constructor(
        private readonly createCmdHandler: ICommandHandler<BrandCreateDTO, string>,
        private readonly getDetailQueryHandler: IQueryHandler<GetDetailQuery, Brand>,
        private readonly updateCmdHandler: ICommandHandler<UpdateCommand, void>,
        private readonly useCase: IBrandUseCase
    ) { }

    async createAPI(req: Request, res: Response) {
        try {
            const result = await this.createCmdHandler.execute(req.body);
            res.status(201).json({
                data: result
            });
        } catch (error) {
            res.status(400).json({
                error: (error as Error).message
            });
        }
    }

    async getDetailAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        const result = await this.getDetailQueryHandler.query({ id });
        res.status(200).json({
            data: result
        });
    }

    async updateCAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        const cmd: UpdateCommand = {
            id,
            dto: req.body
        }

        await this.updateCmdHandler.execute(cmd);
        res.status(200).json({
            data: true
        });
    }

    async deleteAPI(req: Request, res: Response) {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                error: "Invalid category id"
            });
        }

        const result = await this.useCase.deleteBrand(id);
        res.status(200).json({
            data: result
        });
    }

    async listAPI(req: Request, res: Response) {
        // const { success, data: paging, error } = PagingDTOSchema.safeParse(req.query);

        // if (!success) {
        //     return res.status(400).json({
        //         error: error.message
        //     });
        // }

        const paging = {
            page: 1,
            limit: 200
        }

        const result = await this.useCase.listBrands({}, paging);

        res.status(200).json({
            data: result,
            paging,
            filter: {}
        });
    }
}