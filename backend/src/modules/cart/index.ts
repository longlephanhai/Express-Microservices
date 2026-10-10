import { Router } from "express";
import { init } from "./infras/repository/dto";
import { Sequelize } from "sequelize";
import { CartHttpServiceAPI } from "./infras/transport/http-service";
import { CartUseCase } from "./usecase";
import { MySQLCartRepository } from "./infras/repository/repo";

export const setupCartHexagon = (sequelize: Sequelize) => {

    init(sequelize);

    const repository = new MySQLCartRepository(sequelize, "Cart");
    const useCase = new CartUseCase(repository);
    const httpService = new CartHttpServiceAPI(useCase);

    const router = Router();

    router.get("/carts", httpService.listCartItemsAPI.bind(httpService));
    router.get("/carts/:id", httpService.getCartItemAPI.bind(httpService));
    router.post("/carts", httpService.createCartItemAPI.bind(httpService));
    router.patch("/carts/:id", httpService.updateCartItemAPI.bind(httpService));
    router.delete("/carts/:id", httpService.deleteCartItemAPI.bind(httpService));

    return router;
}