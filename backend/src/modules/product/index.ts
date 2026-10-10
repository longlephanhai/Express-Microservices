import { Sequelize } from "sequelize";
import { init } from "./insfra/repository/mysql/dto";
import { MySQLProductCommandRepository, MySQLProductQueryRepository } from "./insfra/repository/mysql/repository";
import { RPCBrandQueryRepository, RPCCategoryQueryRepository } from "./insfra/repository/rpc";
import { IBrandQueryRepository, ICategoryQueryRepository } from "./interface";
import { ProductUseCase } from "./usecase";
import { ProductCommandHTTPServiceAPI, ProductQueryHTTPServiceAPI } from "./insfra/transport/http-service";
import { Router } from "express";


export function setUpProductHexagon(
    sequelize: Sequelize,
    brandQueryRepo: IBrandQueryRepository,
    categoryQueryRepo: ICategoryQueryRepository
) {
    init(sequelize);

    const productQueryRepository = new MySQLProductQueryRepository(sequelize, "Product");
    const productCommandRepository = new MySQLProductCommandRepository(sequelize, "Product");
    const productBrandRepository = brandQueryRepo;
    const productCategoryRepository = categoryQueryRepo;

    const productUseCase = new ProductUseCase(productQueryRepository, productCommandRepository, productBrandRepository, productCategoryRepository);

    const productQueryHttpService = new ProductQueryHTTPServiceAPI(productUseCase);
    const productCommandHttpService = new ProductCommandHTTPServiceAPI(productUseCase);

    const router = Router();

    router.post('/products', productCommandHttpService.createNewProductAPI.bind(productCommandHttpService));
    router.get('/products', productQueryHttpService.listProductsAPI.bind(productQueryHttpService));
    router.get('/products/:id', productQueryHttpService.getDetailProductAPI.bind(productQueryHttpService));
    router.patch('/products/:id', productCommandHttpService.updateProductAPI.bind(productCommandHttpService));
    router.delete('/products/:id', productCommandHttpService.deleteProductAPI.bind(productCommandHttpService));

    return router;

}