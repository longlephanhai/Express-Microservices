import { Router } from "express";
import { Sequelize } from "sequelize";
import { init } from "./infras/repository/dto";
import { MySQLImageRepository } from "./infras/repository/repo";
import { ImageHttpServiceAPI } from "./infras/transport/http-service";
import { ImageUseCase } from "./usecase";

export const setupImagesHexagon = (sequelize: Sequelize) => {
    init(sequelize);

    const repository = new MySQLImageRepository(sequelize);
    const useCase = new ImageUseCase(repository);
    const httpService = new ImageHttpServiceAPI(useCase);
    const router = Router();

    router.get("/images", httpService.listImagesAPI.bind(httpService));
    router.get("/images/:id", httpService.getImageAPI.bind(httpService));
    router.post("/images", httpService.createImageAPI.bind(httpService));
    router.patch("/images/:id", httpService.updateImageAPI.bind(httpService));
    router.delete("/images/:id", httpService.deleteImageAPI.bind(httpService));

    return router;
};