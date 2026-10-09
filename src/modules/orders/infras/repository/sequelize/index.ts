import { Op, Sequelize } from "sequelize";
import { Order, OrderCondDTO, OrderUpdateDTO } from "../../../model/dto";
import { OrderCreateDTO } from "../../../model/dto";
import { modelName } from "./dto";

export class OrderRepository {
  constructor(private readonly sequelize: Sequelize) {}
  private model() { const m = this.sequelize.models[modelName]; if (!m) throw new Error("Order model not initialized"); return m; }
  async get(id: string): Promise<any> { const row = await this.model().findByPk(id); return row?.get({ plain: true }) ?? null; }
  async list(cond: OrderCondDTO = {}): Promise<any[]> { return (await this.model().findAll({ where: { ...cond, status: cond.status ?? { [Op.ne]: "deleted" } }, order: [["created_at", "DESC"]] })).map(x => x.get({ plain: true })); }
  async create(data: OrderCreateDTO & { id: string }): Promise<void> { await this.model().create(data as any); }
  async update(id: string, data: OrderUpdateDTO): Promise<boolean> { const [count] = await this.model().update(data as any, { where: { id, status: { [Op.ne]: "deleted" } } }); return count > 0; }
  async softDelete(id: string): Promise<boolean> { return this.update(id, { status: "deleted" }); }
}
