import { Router } from "express";
import { Sequelize } from "sequelize";
import { init } from "./infras/repository/sequelize/dto";
import { OrderItemRepository } from "./infras/repository/sequelize";
import { OrderItemHttpService } from "./infras/transport";
export function setupOrderItemHexagon(sequelize: Sequelize) {
  init(sequelize); const http = new OrderItemHttpService(new OrderItemRepository(sequelize), sequelize); const router = Router();
  router.post("/order-items", http.createAPI.bind(http)); router.get("/order-items", http.listAPI.bind(http));
  router.get("/order-items/:id", http.detailAPI.bind(http)); router.patch("/order-items/:id", http.updateAPI.bind(http)); router.delete("/order-items/:id", http.deleteAPI.bind(http)); return router;
}
