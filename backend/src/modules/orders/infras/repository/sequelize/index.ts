import { Op, Sequelize } from "sequelize";
import { OrderCondDTO, OrderCreateDTO, OrderUpdateDTO } from "../../../model/dto";
import { Order } from "../../../model/orders";
import { IOrderCommandRepository, IOrderQueryRepository } from "../../../interface";
import { modelName } from "./dto";

export class OrderRepository implements IOrderQueryRepository, IOrderCommandRepository {
  constructor(private readonly sequelize: Sequelize) {}

  private model() {
    const m = this.sequelize.models[modelName];
    if (!m) throw new Error("Order model not initialized");
    return m;
  }

  async get(id: string): Promise<Order | null> {
    const row = await this.model().findByPk(id);
    return (row?.get({ plain: true }) as Order) ?? null;
  }

  async list(cond: OrderCondDTO = {}): Promise<Order[]> {
    const rows = await this.model().findAll({
      where: {
        ...cond,
        status: cond.status ?? { [Op.ne]: "deleted" },
      },
      order: [["created_at", "DESC"]],
    });
    return rows.map((x) => x.get({ plain: true }) as Order);
  }

  async create(data: OrderCreateDTO & { id: string }): Promise<void> {
    await this.model().create(data as any);
  }

  async update(id: string, data: OrderUpdateDTO): Promise<boolean> {
    const [count] = await this.model().update(data as any, {
      where: { id, status: { [Op.ne]: "deleted" } },
    });
    return count > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    return this.update(id, { status: "deleted" });
  }
}

