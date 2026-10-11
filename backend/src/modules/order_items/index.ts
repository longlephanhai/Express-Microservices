import { Router } from "express";
import { Sequelize } from "sequelize";
import { init } from "./infras/repository/sequelize/dto";
import { OrderItemRepository } from "./infras/repository/sequelize";
import { OrderItemUseCase } from "./usecase";
import { OrderItemHttpService } from "./infras/transport";
import { authMiddleware } from "../../share/middleware/auth";

export function setupOrderItemHexagon(sequelize: Sequelize) {
  init(sequelize);
  const repository = new OrderItemRepository(sequelize);
  const useCase = new OrderItemUseCase(repository, repository);


  const orderExistsCheck = async (orderId: string): Promise<boolean> => {
    const orderModel = sequelize.models.Order;
    if (!orderModel) return true;
    const order = await orderModel.findByPk(orderId);
    return !!order && (order as any).status !== "deleted";
  };

  const http = new OrderItemHttpService(useCase, orderExistsCheck);
  const router = Router();
  router.use(authMiddleware);
  router.post("/order-items", http.createAPI.bind(http));
  router.get("/order-items", http.listAPI.bind(http));
  router.get("/order-items/:id", http.detailAPI.bind(http));
  router.patch("/order-items/:id", http.updateAPI.bind(http));
  router.delete("/order-items/:id", http.deleteAPI.bind(http));

  return router;
}

