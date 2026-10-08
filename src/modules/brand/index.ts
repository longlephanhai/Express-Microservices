import { Request, Response, Router } from "express";
import { Sequelize } from "sequelize";
import { MySQLBrandRespository } from "./infras/repository/sequelize";
import { init } from "./infras/repository/sequelize/dto";
import { BrandHttpService } from "./infras/transport";
import { CreateNewBrandCmdHandler } from "./usecase/create-new-brand";
import { DeleteBrandCmdHandler } from "./usecase/delete-brand";
import { GetBrandDetailQuery } from "./usecase/get-brand-detail";
import { ListBrandQuery } from "./usecase/list-brand";
import { UpdateBrandCmdHandler } from "./usecase/update-brand";

export const setupBrandHexagon = (sequelize: Sequelize) => {
  init(sequelize);

  const repository = new MySQLBrandRespository(sequelize);

  const createCmdHandler = new CreateNewBrandCmdHandler(repository);
  const getDetailQueryHandler = new GetBrandDetailQuery(repository);
  const updateCmdHandler = new UpdateBrandCmdHandler(repository);
  const deleteCmdHandler = new DeleteBrandCmdHandler(repository);
  const listQueryHandler = new ListBrandQuery(repository);

  const httpService = new BrandHttpService(
    createCmdHandler,
    getDetailQueryHandler,
    updateCmdHandler,
    deleteCmdHandler,
    listQueryHandler
  );

  const router = Router();

  router.post('/brands', httpService.createAPI.bind(httpService));
  router.get('/brands/:id', httpService.getDetailAPI.bind(httpService));
  router.get('/brands', httpService.listAPI.bind(httpService));
  router.patch('/brands/:id', httpService.updateAPI.bind(httpService));
  router.delete('/brands/:id', httpService.deleteAPI.bind(httpService));

  router.post('/rpc/brands', (req: Request, res: Response) => {
    const { ids } = req.body;
    //...
  });

  return router;
};