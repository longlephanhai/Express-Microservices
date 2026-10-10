import { v7 } from "uuid";
import { ErrDataNotFound } from "../../../share/model/base-error";
import {
  IOrderItemCommandRepository,
  IOrderItemCommandUseCase,
  IOrderItemQueryRepository,
  IOrderItemQueryUseCase,
} from "../interface";
import {
  OrderItemCreateDTO,
  OrderItemCreateDTOSchema,
  OrderItemUpdateDTO,
  OrderItemUpdateDTOSchema,
} from "../model/dto";
import { OrderItem } from "../model/order-item";

export class OrderItemUseCase implements IOrderItemQueryUseCase, IOrderItemCommandUseCase {
  constructor(
    private readonly queryRepository: IOrderItemQueryRepository,
    private readonly commandRepository: IOrderItemCommandRepository,
  ) {}

  async getDetailOrderItem(id: string): Promise<OrderItem | null> {
    const item = await this.queryRepository.get(id);
    if (!item) throw ErrDataNotFound;
    return item;
  }

  async listOrderItems(orderId?: string): Promise<OrderItem[]> {
    return this.queryRepository.list(orderId);
  }

  async createOrderItem(data: OrderItemCreateDTO): Promise<string> {
    const dto = OrderItemCreateDTOSchema.parse(data);
    const id = v7();
    await this.commandRepository.create({ ...dto, id });
    return id;
  }

  async updateOrderItem(id: string, data: OrderItemUpdateDTO): Promise<boolean> {
    const dto = OrderItemUpdateDTOSchema.parse(data);
    const item = await this.queryRepository.get(id);
    if (!item) throw ErrDataNotFound;
    return this.commandRepository.update(id, dto);
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    const item = await this.queryRepository.get(id);
    if (!item) throw ErrDataNotFound;
    return this.commandRepository.delete(id);
  }
}
