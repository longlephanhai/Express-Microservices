import { Router } from "express";
import { init } from "./infras/repository/dto";
import { Sequelize } from "sequelize";
import { CategoryHttpServiceAPI } from "./infras/transport/http-service";
import { CategoryUseCase } from "./usecase";
import { MySQLCategoryRepository } from "./infras/repository/repo";

export const setupCategoryHexagon = (sequelize: Sequelize) => {

    init(sequelize);

    const repository = new MySQLCategoryRepository(sequelize, "Category");
    const useCase = new CategoryUseCase(repository);
    const httpService = new CategoryHttpServiceAPI(useCase);

    const router = Router();

    router.get("/categories", httpService.listCategoriesAPI.bind(httpService));
    router.get("/categories/:id", httpService.getDetailCategoryAPI.bind(httpService));
    router.post("/categories", httpService.createNewCategoryAPI.bind(httpService));
    router.patch("/categories/:id", httpService.updateCategoryAPI.bind(httpService));
    router.delete("/categories/:id", httpService.deleteCategoryAPI.bind(httpService));


    return router;
}