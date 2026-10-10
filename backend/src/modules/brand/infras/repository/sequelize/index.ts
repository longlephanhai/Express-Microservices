
import { Sequelize } from "sequelize";
import { modelName } from "./dto";
import { BaseCommandRepositorySequelize, BaseQueryRepositorySequelize, BaseRepositorySequelize } from "../../../../../share/repository/repo-sequelize";
import { Brand } from "../../../model/brand";
import { BrandCondDTO, BrandUpdateDTO } from "../../../model/dto";

export class MySQLBrandRespository extends BaseRepositorySequelize<Brand, BrandCondDTO, BrandUpdateDTO> {
  constructor(sequelize: Sequelize) {
    super(
      new MySQLQueryRepository(sequelize, modelName),
      new MySQLCommandRepository(sequelize, modelName)
    );
  }
}

export class MySQLQueryRepository extends BaseQueryRepositorySequelize<Brand, BrandCondDTO> {}
export class MySQLCommandRepository extends BaseCommandRepositorySequelize<Brand, BrandUpdateDTO> {}
