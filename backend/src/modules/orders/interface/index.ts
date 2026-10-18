import { Order, OrderCondDTO, OrderCreateDTO, OrderUpdateDTO, OrderItem } from "../model/dto";

// Business logic layer
export interface IOrderQueryUseCase {
  getDetailOrder(id: string): Promise<Order | null>;
  listOrders(cond?: OrderCondDTO): Promise<Order[]>;
  listOrderItems(orderId: string): Promise<OrderItem[]>;
}

export interface IOrderCommandUseCase {
  createOrder(data: OrderCreateDTO): Promise<string>;
  updateOrder(id: string, data: OrderUpdateDTO): Promise<boolean>;
  deleteOrder(id: string): Promise<boolean>;
}

// Repository layer
export interface IOrderQueryRepository {
  get(id: string): Promise<Order | null>;
  list(cond?: OrderCondDTO): Promise<Order[]>;
  listItems(orderId: string): Promise<OrderItem[]>;
}

export interface IOrderCommandRepository {
  create(data: OrderCreateDTO & { id: string }): Promise<void>;
  update(id: string, data: OrderUpdateDTO): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
}

