import { OrderItem } from "../model/order-item";
import { OrderItemCreateDTO, OrderItemUpdateDTO } from "../model/dto";

// Business logic layer
export interface IOrderItemQueryUseCase {
  getDetailOrderItem(id: string): Promise<OrderItem | null>;
  listOrderItems(orderId?: string): Promise<OrderItem[]>;
}

export interface IOrderItemCommandUseCase {
  createOrderItem(data: OrderItemCreateDTO): Promise<string>;
  updateOrderItem(id: string, data: OrderItemUpdateDTO): Promise<boolean>;
  deleteOrderItem(id: string): Promise<boolean>;
}

// Repository layer
export interface IOrderItemQueryRepository {
  get(id: string): Promise<OrderItem | null>;
  list(orderId?: string): Promise<OrderItem[]>;
}

export interface IOrderItemCommandRepository {
  create(data: OrderItemCreateDTO & { id: string }): Promise<void>;
  update(id: string, data: OrderItemUpdateDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
