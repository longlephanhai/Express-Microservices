import { Request, Response } from "express";
import { OrderItemUseCase } from "../../usecase";
import { OrderItemCreateDTOSchema, OrderItemUpdateDTOSchema } from "../../model/dto";
import { ErrDataNotFound } from "../../../../share/model/base-error";

export class OrderItemHttpService {
  constructor(
    private readonly useCase: OrderItemUseCase,
    private readonly orderExistsCheck?: (orderId: string) => Promise<boolean>
  ) {}

  async createAPI(req: Request, res: Response) {
    const parsed = OrderItemCreateDTOSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order item data",
        errors: parsed.error.issues,
      });
    }

    try {
      if (this.orderExistsCheck) {
        const exists = await this.orderExistsCheck(parsed.data.order_id);
        if (!exists) {
          return res.status(404).json({ message: "Order not found" });
        }
      }

      const id = await this.useCase.createOrderItem(parsed.data);
      return res.status(201).json({ data: { id } });
    } catch (e) {
      return res.status(400).json({ message: (e as Error).message });
    }
  }

  async listAPI(req: Request, res: Response) {
    try {
      const orderId = typeof req.query.order_id === "string" ? req.query.order_id : undefined;
      const data = await this.useCase.listOrderItems(orderId);
      return res.status(200).json({ data });
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
      const row = await this.useCase.getDetailOrderItem(id);
      return res.status(200).json({ data: row });
    } catch (e) {
      if (e === ErrDataNotFound || (e as Error).message === ErrDataNotFound.message) {
        return res.status(404).json({ message: "Order item not found" });
      }
      return res.status(400).json({ message: (e as Error).message });
    }
  }

  async updateAPI(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid id" });
    }

    const parsed = OrderItemUpdateDTOSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order item data",
        errors: parsed.error.issues,
      });
    }

    try {
      const ok = await this.useCase.updateOrderItem(id, parsed.data);
      return ok ? res.status(200).json({ data: true }) : res.status(404).json({ message: "Order item not found" });
    } catch (e) {
      if (e === ErrDataNotFound || (e as Error).message === ErrDataNotFound.message) {
        return res.status(404).json({ message: "Order item not found" });
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
      const ok = await this.useCase.deleteOrderItem(id);
      return ok ? res.status(200).json({ data: true }) : res.status(404).json({ message: "Order item not found" });
    } catch (e) {
      if (e === ErrDataNotFound || (e as Error).message === ErrDataNotFound.message) {
        return res.status(404).json({ message: "Order item not found" });
      }
      return res.status(400).json({ message: (e as Error).message });
    }
  }
}

