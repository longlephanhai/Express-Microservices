import { Sequelize } from "sequelize";
import { OrderItemCreateDTO, OrderItemUpdateDTO } from "../../../model/dto";
import { OrderItem } from "../../../model/order-item";
import { IOrderItemCommandRepository, IOrderItemQueryRepository } from "../../../interface";
import { modelName } from "./dto";

export class OrderItemRepository implements IOrderItemQueryRepository, IOrderItemCommandRepository {
  constructor(private readonly sequelize: Sequelize) {}

  private model() {
    const m = this.sequelize.models[modelName];
    if (!m) throw new Error("OrderItem model not initialized");
    return m;
  }

  async get(id: string): Promise<OrderItem | null> {
    const row = await this.model().findByPk(id);
    return (row?.get({ plain: true }) as OrderItem) ?? null;
  }

  async list(orderId?: string): Promise<OrderItem[]> {
    const rows = await this.model().findAll({
      where: orderId ? { order_id: orderId } : {},
      order: [["id", "DESC"]],
    });
    return rows.map((x) => x.get({ plain: true }) as OrderItem);
  }

  async create(data: OrderItemCreateDTO & { id: string }): Promise<void> {
    await this.model().create(data as any);
  }

  async update(id: string, data: OrderItemUpdateDTO): Promise<boolean> {
    const [count] = await this.model().update(data as any, { where: { id } });
    return count > 0;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.model().destroy({ where: { id } });
    return count > 0;
  }
}

