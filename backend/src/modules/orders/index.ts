import { Router } from "express";
import { Sequelize } from "sequelize";
import { init } from "./infras/repository/sequelize/dto";
import { OrderRepository } from "./infras/repository/sequelize";
import { OrderHttpService } from "./infras/transport";
export function setupOrderHexagon(sequelize: Sequelize) {
  init(sequelize); const http = new OrderHttpService(new OrderRepository(sequelize)); const router = Router();
  router.post("/orders", http.createAPI.bind(http)); router.get("/orders", http.listAPI.bind(http));
  router.get("/orders/:id", http.detailAPI.bind(http)); router.patch("/orders/:id", http.updateAPI.bind(http)); router.delete("/orders/:id", http.deleteAPI.bind(http)); return router;
}
