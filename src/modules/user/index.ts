import { Sequelize } from "sequelize";

import { MySQLUserCommandRepository, MySQLUserQueryRepository } from "./infras/repository/mysql";

import { UserUseCase } from "./usecase";
import { UserHTTPServiceAPI } from "./infras/transport/http-service";
import { Router } from "express";
import { init, modelName } from "./infras/repository/mysql/dto";

export const setupUserHexagon = (sequelize: Sequelize) => {
    init(sequelize);

    const repositoryQuery = new MySQLUserQueryRepository(sequelize, modelName);
    const repositoryCommand = new MySQLUserCommandRepository(sequelize, modelName);

    const usecase = new UserUseCase(repositoryQuery, repositoryCommand);

    const httpService = new UserHTTPServiceAPI(usecase);

    const router = Router();

    router.post('/auth/register', httpService.registerUserAPI.bind(httpService));

    return router;
};