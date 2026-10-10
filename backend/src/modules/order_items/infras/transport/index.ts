import { Request, Response } from "express";
import { v7 } from "uuid";
import { OrderItemRepository } from "../repository/sequelize";
import { OrderItemCreateDTOSchema, OrderItemUpdateDTOSchema } from "../../model/dto";
export class OrderItemHttpService {
  constructor(private readonly repo: OrderItemRepository, private readonly sequelize: any) {}
  async createAPI(req: Request, res: Response) { const parsed = OrderItemCreateDTOSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ message: "Invalid order item data", errors: parsed.error.issues }); try { const order = await this.sequelize.models.Order.findByPk(parsed.data.order_id); if (!order || order.status === "deleted") return res.status(404).json({ message: "Order not found" }); const id = v7(); await this.repo.create({ ...parsed.data, id }); return res.status(201).json({ data: { id } }); } catch (e) { return res.status(400).json({ message: (e as Error).message }); } }
  async listAPI(req: Request, res: Response) { try { return res.json({ data: await this.repo.list(typeof req.query.order_id === "string" ? req.query.order_id : undefined) }); } catch (e) { return res.status(500).json({ message: (e as Error).message }); } }
  async detailAPI(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid id" });
    const row = await this.repo.get(id);
    return row ? res.json({ data: row }) : res.status(404).json({ message: "Order item not found" });
  }
  async updateAPI(req: Request, res: Response) {
    const parsed = OrderItemUpdateDTOSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid order item data", errors: parsed.error.issues });
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid id" });
    try { const ok = await this.repo.update(id, parsed.data); return ok ? res.json({ data: true }) : res.status(404).json({ message: "Order item not found" }); } catch (e) { return res.status(400).json({ message: (e as Error).message }); }
  }
  async deleteAPI(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid id" });
    const ok = await this.repo.delete(id);
    return ok ? res.json({ data: true }) : res.status(404).json({ message: "Order item not found" });
  }
}
