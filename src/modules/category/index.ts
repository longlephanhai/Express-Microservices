import { Router } from "express";
import { getCategoryApi } from "./infras/get-api";
import { listCategoryApi } from "./infras/list-api";
import { updateCategoryApi } from "./infras/update-api";
import { deleteCategoryApi } from "./infras/delete-api";
import { createCategory } from "./infras/create-api";
import { init } from "./infras/repository/dto";
import { Sequelize } from "sequelize";

export const setupCategoryModule = (sequelize: Sequelize) => {

    init(sequelize);

    const router = Router();

    router.get("/categories", listCategoryApi);
    router.get("/categories/:id", getCategoryApi);
    router.post("/categories", createCategory);
    router.patch("/categories/:id", updateCategoryApi);
    router.delete("/categories/:id", deleteCategoryApi);


    return router;
}