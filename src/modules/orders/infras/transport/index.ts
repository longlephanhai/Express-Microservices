import { Request, Response } from "express";
import { OrderRepository } from "../repository/sequelize";
import { OrderCreateDTOSchema, OrderUpdateDTOSchema } from "../../model/dto";
import { v7 } from "uuid";

export class OrderHttpService {
  constructor(private readonly repo: OrderRepository) {}
  async createAPI(req: Request, res: Response) { const parsed = OrderCreateDTOSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ message: "Invalid order data", errors: parsed.error.issues }); try { const id = v7(); await this.repo.create({ ...parsed.data, id }); return res.status(201).json({ data: { id } }); } catch (e) { return res.status(400).json({ message: (e as Error).message }); } }
  async listAPI(req: Request, res: Response) { try { const cond: any = {}; for (const k of ["user_id", "status", "payment_status", "tracking_number"]) if (typeof req.query[k] === "string") cond[k] = req.query[k]; return res.json({ data: await this.repo.list(cond) }); } catch (e) { return res.status(500).json({ message: (e as Error).message }); } }
  async detailAPI(req: Request, res: Response) {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid id" });
    const row = await this.repo.get(id);
    return row && row.status !== "deleted" ? res.json({ data: row }) : res.status(404).json({ message: "Order not found" });
  }
  async updateAPI(req: Request, res: Response) {
    const parsed = OrderUpdateDTOSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid order data", errors: parsed.error.issues });
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid id" });
    try {
      const ok = await this.repo.update(id, parsed.data);
      return ok ? res.json({ data: true }) : res.status(404).json({ message: "Order not found" });
    } catch (e) {
      return res.status(400).json({ message: (e as Error).message });
    }
  }
  async deleteAPI(req: Request, res: Response) {
    const id = req.params.id;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid id" });
    const ok = await this.repo.softDelete(id);
    return ok ? res.json({ data: true }) : res.status(404).json({ message: "Order not found" });
  }
}
