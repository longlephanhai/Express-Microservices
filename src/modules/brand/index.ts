import { Sequelize } from "sequelize";
import { init } from "../category/infras/repository/dto";
import { MysqlBrandRepository } from "./infras/repository/sequelize";
import { BrandHttpServiceAPI } from "./infras/transport/http-service/express";
import { Router } from "express";
import { CreateNewBrandCmdUseCase } from "./usecase/create-new-brand";
import { BrandUseCase } from "./usecase";

import { GetBrandDetailQuery } from "./usecase/get-brand-detail";
import { UpdateBrandCmdUseCase } from "./usecase/update-brand";

export const setupBrandHexagon = (sequelize: Sequelize) => {

    init(sequelize);

    const repository = new MysqlBrandRepository(sequelize);
    const useCase = new BrandUseCase(repository);
    const createCmdHandler = new CreateNewBrandCmdUseCase(repository);
    const getDetailQueryHandler = new GetBrandDetailQuery(repository);
    const updateCmdHandler = new UpdateBrandCmdUseCase(repository);
    // @ts-ignore
    const httpService = new BrandHttpServiceAPI(createCmdHandler, getDetailQueryHandler, updateCmdHandler, useCase);

    const router = Router();

    router.get("/brands", httpService.listAPI.bind(httpService));
    router.get("/brands/:id", httpService.getDetailAPI.bind(httpService));
    router.post("/brands", httpService.createAPI.bind(httpService));
    router.patch("/brands/:id", httpService.updateCAPI.bind(httpService));
    router.delete("/brands/:id", httpService.deleteAPI.bind(httpService));


    return router;
}