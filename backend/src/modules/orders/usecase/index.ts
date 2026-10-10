import { v7 } from "uuid";
import { ErrDataNotFound } from "../../../share/model/base-error";
import {
  IOrderCommandRepository,
  IOrderCommandUseCase,
  IOrderQueryRepository,
  IOrderQueryUseCase,
} from "../interface";
import { OrderCondDTO, OrderCreateDTO, OrderCreateDTOSchema, OrderUpdateDTO, OrderUpdateDTOSchema } from "../model/dto";
import { Order } from "../model/orders";

export class OrderUseCase implements IOrderQueryUseCase, IOrderCommandUseCase {
  constructor(
    private readonly queryRepository: IOrderQueryRepository,
    private readonly commandRepository: IOrderCommandRepository,
  ) {}

  async getDetailOrder(id: string): Promise<Order | null> {
    const order = await this.queryRepository.get(id);
    if (!order || order.status === "deleted") throw ErrDataNotFound;
    return order;
  }

  async listOrders(cond: OrderCondDTO = {}): Promise<Order[]> {
    return this.queryRepository.list(cond);
  }

  async createOrder(data: OrderCreateDTO): Promise<string> {
    const dto = OrderCreateDTOSchema.parse(data);
    const id = v7();
    await this.commandRepository.create({ ...dto, id });
    return id;
  }

  async updateOrder(id: string, data: OrderUpdateDTO): Promise<boolean> {
    const dto = OrderUpdateDTOSchema.parse(data);
    const order = await this.queryRepository.get(id);
    if (!order || order.status === "deleted") throw ErrDataNotFound;
    return this.commandRepository.update(id, dto);
  }

  async deleteOrder(id: string): Promise<boolean> {
    const order = await this.queryRepository.get(id);
    if (!order || order.status === "deleted") throw ErrDataNotFound;
    return this.commandRepository.softDelete(id);
  }
}
