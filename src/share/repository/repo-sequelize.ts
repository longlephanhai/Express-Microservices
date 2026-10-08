

import { Op, Sequelize } from "sequelize";
import { ICommandRepository, IQueryRepository, IRepository } from "../interface";
import { PagingDTO } from "../model/paging";
import { ModelStatus } from "../model/base-model";

export abstract class BaseRepositorySequelize<Entity, Cond, UpdateDTO> implements IRepository<Entity, Cond, UpdateDTO> {
  constructor(
    readonly queryRepo: IQueryRepository<Entity, Cond>,
    readonly cmdRepo: ICommandRepository<Entity, UpdateDTO>,
  ) { }

  async get(id: string): Promise<Entity | null> {
    return await this.queryRepo.get(id);
  }

  async findByCond(cond: Cond): Promise<Entity | null> {
    return await this.queryRepo.findByCond(cond);
  }

  async list(cond: Cond, paging: PagingDTO): Promise<Array<Entity>> {
    return await this.queryRepo.list(cond, paging);
  }

  async insert(data: Entity): Promise<boolean> {
    return await this.cmdRepo.insert(data);
  }

  async update(id: string, data: UpdateDTO): Promise<boolean> {
    return await this.cmdRepo.update(id, data);
  }

  async delete(id: string, isHard: boolean): Promise<boolean> {
    return await this.cmdRepo.delete(id, isHard);
  }
}

export abstract class BaseQueryRepositorySequelize<Entity, Cond> implements IQueryRepository<Entity, Cond> {
  constructor(readonly sequelize: Sequelize, readonly modelName: string) { }

  protected getModel() {
    const model = this.sequelize.models[this.modelName];

    if (!model) {
      throw new Error(`Model "${this.modelName}" was not found in the Sequelize registry.`);
    }

    return model;
  }

  async get(id: string): Promise<Entity | null> {
    const model = this.getModel();
    const data = await model.findByPk(id);

    if (!data) {
      return null;
    }

    const persistenceData = data.get({ plain: true });
    const { created_at, updated_at, ...props } = persistenceData;

    return {
      ...props,
      createdAt: persistenceData.created_at,
      updatedAt: persistenceData.updated_at,
    } as Entity;
  }

  async findByCond(cond: Cond): Promise<Entity | null> {
    const model = this.getModel();
    const data = await model.findOne({ where: cond as any });

    if (!data) {
      return null;
    }

    const persistenceData = data.get({ plain: true });
    return persistenceData as Entity;
  }

  async list(cond: Cond, paging: PagingDTO): Promise<Array<Entity>> {
    const { page, limit } = paging;
    const model = this.getModel();

    const condSQL = { ...cond, status: { [Op.ne]: ModelStatus.DELETED } };

    const total = await model.count({ where: condSQL });
    paging.total = total;

    const rows = await model.findAll({ where: condSQL, limit, offset: (page - 1) * limit, order: [['id', 'DESC']] });

    return rows.map((row) => row.get({ plain: true }));
  }
}

export abstract class BaseCommandRepositorySequelize<Entity, UpdateDTO> implements ICommandRepository<Entity, UpdateDTO> {
  constructor(readonly sequelize: Sequelize, readonly modelName: string) { }

  protected getModel() {
    const model = this.sequelize.models[this.modelName];

    if (!model) {
      throw new Error(`Model "${this.modelName}" was not found in the Sequelize registry.`);
    }

    return model;
  }

  async insert(data: Entity): Promise<boolean> {
    const model = this.getModel();
    await model.create(data as any);
    return true;
  }

  async update(id: string, data: UpdateDTO): Promise<boolean> {
    const model = this.getModel();
    await model.update(data as any, { where: { id } });
    return true;
  }

  async delete(id: string, isHard: boolean = false): Promise<boolean> {
    const model = this.getModel();

    if (!isHard) {
      await model.update({ status: ModelStatus.DELETED }, { where: { id } });
    } else {
      await model.destroy({ where: { id } });
    }

    return true;
  }
}