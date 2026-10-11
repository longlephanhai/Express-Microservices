import { Request, Response } from "express";
import { OrderUseCase } from "../../usecase";
import { OrderCreateDTOSchema, OrderUpdateDTOSchema } from "../../model/dto";
import { ErrDataNotFound } from "../../../../share/model/base-error";

export class OrderHttpService {
  constructor(private readonly useCase: OrderUseCase) {}

  async createAPI(req: Request, res: Response) {
    const userId = req.userId || req.body?.user_id;
    const bodyWithUser = {
      ...req.body,
      user_id: userId,
    };
    const parsed = OrderCreateDTOSchema.safeParse(bodyWithUser);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order data",
        errors: parsed.error.issues,
      });
    }

    try {
      const id = await this.useCase.createOrder(parsed.data);
      return res.status(201).json({ data: { id } });
    } catch (e) {
      return res.status(400).json({ message: (e as Error).message });
    }
  }

  async listAPI(req: Request, res: Response) {
    try {
      const cond: any = {};
      for (const k of ["user_id", "status", "payment_status", "tracking_number"]) {
        if (typeof req.query[k] === "string") {
          cond[k] = req.query[k];
        }
      }

      if (req.userId && req.userRole !== "admin") {
        cond.user_id = req.userId;
      }

      const orders = await this.useCase.listOrders(cond);
      return res.status(200).json({ data: orders });
    } catch (e) {
      return res.status(500).json({ message: (e as Error).message });
    }
  }

  async detailAPI(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid id" });
    }

    try {
      const row = await this.useCase.getDetailOrder(id);
      return res.status(200).json({ data: row });
    } catch (e) {
      if (e === ErrDataNotFound || (e as Error).message === ErrDataNotFound.message) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(400).json({ message: (e as Error).message });
    }
  }

  async updateAPI(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid id" });
    }

    const parsed = OrderUpdateDTOSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order data",
        errors: parsed.error.issues,
      });
    }

    try {
      const ok = await this.useCase.updateOrder(id, parsed.data);
      return ok ? res.status(200).json({ data: true }) : res.status(404).json({ message: "Order not found" });
    } catch (e) {
      if (e === ErrDataNotFound || (e as Error).message === ErrDataNotFound.message) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(400).json({ message: (e as Error).message });
    }
  }

  async deleteAPI(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid id" });
    }

    try {
      const ok = await this.useCase.deleteOrder(id);
      return ok ? res.status(200).json({ data: true }) : res.status(404).json({ message: "Order not found" });
    } catch (e) {
      if (e === ErrDataNotFound || (e as Error).message === ErrDataNotFound.message) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(400).json({ message: (e as Error).message });
    }
  }
}
