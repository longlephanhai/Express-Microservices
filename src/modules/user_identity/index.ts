import { Sequelize } from "sequelize";
import { init } from "./insfra/repository/mysql/dto";
import { MySQLUserIdentityCommandRepository, MySQLUserIdentityQueryRepository } from "./insfra/repository/mysql/repository";
import { UserIdentityUseCase } from "./usecase";
import { UserIdentityHttpServiceAPI } from "./insfra/transport/http-service";
import { Router } from "express";

export function setUpUserIdentityHexagon(sequelize: Sequelize) {
    init(sequelize);

    const queryRepository = new MySQLUserIdentityQueryRepository(sequelize, "UserIdentity");
    const commandRepository = new MySQLUserIdentityCommandRepository(sequelize, "UserIdentity");
    const useCase = new UserIdentityUseCase(queryRepository, commandRepository);
    const httpService = new UserIdentityHttpServiceAPI(useCase);

    const router = Router();

    router.post("/user-identities", httpService.createUserIdentityAPI.bind(httpService));
    router.get("/user-identities", httpService.listUserIdentitiesAPI.bind(httpService));
    router.get("/user-identities/:id", httpService.getUserIdentityAPI.bind(httpService));
    router.patch("/user-identities/:id", httpService.updateUserIdentityAPI.bind(httpService));
    router.delete("/user-identities/:id", httpService.deleteUserIdentityAPI.bind(httpService));

    return router;
}