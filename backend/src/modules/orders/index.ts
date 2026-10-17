import { Router } from "express";
import { Sequelize } from "sequelize";
import { init } from "./infras/repository/sequelize/dto";
import { OrderRepository } from "./infras/repository/sequelize";
import { OrderUseCase } from "./usecase";
import { OrderHttpService } from "./infras/transport";
import { authMiddleware } from "../../share/middleware/auth";

export function setupOrderHexagon(sequelize: Sequelize) {
  init(sequelize);
  const repository = new OrderRepository(sequelize);
  const useCase = new OrderUseCase(repository, repository);
  const http = new OrderHttpService(useCase);

  const router = Router();
  router.use(authMiddleware);

  router.post("/orders", http.createAPI.bind(http));
  router.get("/orders", http.listAPI.bind(http));
  router.get("/orders/:id", http.detailAPI.bind(http));
  router.patch("/orders/:id", http.updateAPI.bind(http));
  router.delete("/orders/:id", http.deleteAPI.bind(http));

  return router;
}

