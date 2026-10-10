import { Sequelize } from "sequelize";
import { OrderItemCreateDTO, OrderItemUpdateDTO } from "../../../model/dto";
import { modelName } from "./dto";
export class OrderItemRepository {
  constructor(private readonly sequelize: Sequelize) {}
  private model() { const m = this.sequelize.models[modelName]; if (!m) throw new Error("OrderItem model not initialized"); return m; }
  async get(id: string): Promise<any> { const row = await this.model().findByPk(id); return row?.get({ plain: true }) ?? null; }
  async list(orderId?: string): Promise<any[]> { return (await this.model().findAll({ where: orderId ? { order_id: orderId } : {}, order: [["id", "DESC"]] })).map(x => x.get({ plain: true })); }
  async create(data: OrderItemCreateDTO & { id: string }): Promise<void> { await this.model().create(data as any); }
  async update(id: string, data: OrderItemUpdateDTO): Promise<boolean> { const [count] = await this.model().update(data as any, { where: { id } }); return count > 0; }
  async delete(id: string): Promise<boolean> { const count = await this.model().destroy({ where: { id } }); return count > 0; }
}
