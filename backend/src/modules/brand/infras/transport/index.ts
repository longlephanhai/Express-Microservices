
import { Request, Response } from "express";
import { ICommandHandler, IQueryHandler } from "../../../../share/interface";
import { CreateCommand, DeleteCommand, GetDetailQuery, ListQuery, UpdateCommand } from "../../interface";
import { Brand } from "../../model/brand";
import { PagingDTOSchema } from "../../../../share/model/paging";

export class BrandHttpService {
  constructor(
    private readonly createCmdHandler: ICommandHandler<CreateCommand, string>,
    private readonly getDetailQueryHandler: IQueryHandler<GetDetailQuery, Brand>,
    private readonly updateCmdHandler: ICommandHandler<UpdateCommand, void>,
    private readonly deleteCmdHandler: ICommandHandler<DeleteCommand, void>,
    private readonly listQueryHandler: IQueryHandler<ListQuery, Brand[]>
  ) { }

  async createAPI(req: Request, res: Response) {
    try {
      const cmd: CreateCommand = { dto: req.body };
      const result = await this.createCmdHandler.execute(cmd);

      res.status(201).json({ data: result });
    } catch (error) {
      res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async getDetailAPI(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        message: "Invalid brand id",
      });

      return;
    }

    try {
      const result = await this.getDetailQueryHandler.query({ id });
      res.status(200).json({ data: result });
    } catch (error) {
      res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async updateAPI(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        message: "Invalid brand id",
      });

      return;
    }

    const cmd: UpdateCommand = { id, dto: req.body };

    try {
      await this.updateCmdHandler.execute(cmd);
      res.status(200).json({ data: true });
    } catch (error) {
      res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async deleteAPI(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        message: "Invalid brand id",
      });

      return;
    }

    try {
      await this.deleteCmdHandler.execute({ id, isHardDelete: false });
      res.status(200).json({ data: true });
    } catch (error) {
      res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async listAPI(req: Request, res: Response) {
    const { success, data: paging, error } = PagingDTOSchema.safeParse(req.query);

    if (!success) {
      res.status(400).json({
        message: 'Invalid paging',
        error: error.message,
      });

      return;
    }

    const result = await this.listQueryHandler.query({ cond: {}, paging });

    res.status(200).json({ data: result, paging, filter: {} });
  }

  async listByIds(req: Request, res: Response) {
    // call directly to repository
    // it's OK. Because this layer on the same level with repository
  }
}