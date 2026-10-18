import { Op, Sequelize } from "sequelize";
import { v7 } from "uuid";
import { OrderCondDTO, OrderCreateDTO, OrderUpdateDTO, OrderItem } from "../../../model/dto";
import { Order } from "../../../model/orders";
import { IOrderCommandRepository, IOrderQueryRepository } from "../../../interface";
import { orderModelName, orderItemModelName } from "./dto";

export class OrderRepository implements IOrderQueryRepository, IOrderCommandRepository {
  constructor(private readonly sequelize: Sequelize) {}

  private orderModel() {
    const m = this.sequelize.models[orderModelName];
    if (!m) throw new Error("Order model not initialized");
    return m;
  }

  private itemModel() {
    const m = this.sequelize.models[orderItemModelName];
    if (!m) throw new Error("OrderItem model not initialized");
    return m;
  }

  async get(id: string): Promise<Order | null> {
    const row = await this.orderModel().findByPk(id, {
      include: [
        {
          model: this.itemModel(),
          as: "items",
        },
      ],
    });
    return (row?.get({ plain: true }) as Order) ?? null;
  }

  async list(cond: OrderCondDTO = {}): Promise<Order[]> {
    const rows = await this.orderModel().findAll({
      where: {
        ...cond,
        status: cond.status ?? { [Op.ne]: "deleted" },
      },
      include: [
        {
          model: this.itemModel(),
          as: "items",
        },
      ],
      order: [["created_at", "DESC"]],
    });
    return rows.map((x) => x.get({ plain: true }) as Order);
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
    const rows = await this.itemModel().findAll({
      where: { order_id: orderId },
      order: [["id", "ASC"]],
    });
    return rows.map((x) => x.get({ plain: true }) as OrderItem);
  }

  async create(data: OrderCreateDTO & { id: string }): Promise<void> {
    const { items, ...orderData } = data;
    const t = await this.sequelize.transaction();
    try {
      await this.orderModel().create(orderData as any, { transaction: t });
      if (items && items.length > 0) {
        const itemRecords = items.map((item) => ({
          ...item,
          id: v7(),
          order_id: data.id,
        }));
        await this.itemModel().bulkCreate(itemRecords as any, { transaction: t });
      }
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async update(id: string, data: OrderUpdateDTO): Promise<boolean> {
    const [count] = await this.orderModel().update(data as any, {
      where: { id, status: { [Op.ne]: "deleted" } },
    });
    return count > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    return this.update(id, { status: "deleted" });
  }
}


