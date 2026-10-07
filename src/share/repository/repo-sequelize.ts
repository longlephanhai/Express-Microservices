import { Op, Sequelize } from "sequelize";
import { IRepository } from "../interface";
import { PagingDTO } from "../model/paging";
import { ModelStatus } from "../model/base-model";

export abstract class BaseRepositorySequelize<Entity, CondDTO, UpdateDTO> implements IRepository<Entity, CondDTO, UpdateDTO> {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async findByCond(cond: CondDTO): Promise<Entity | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findOne({ where: cond as any });
        if (!data) {
            return null;
        }

        const plainData = data.get({ plain: true });
        return ({
            ...plainData,
            createdAt: plainData.created_at,
            updatedAt: plainData.updated_at,
        }) as Entity;
    }

    async get(id: string): Promise<Entity | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findByPk(id);
        if (!data) {
            return null;
        }

        const plainData = data.get({ plain: true });
        return ({
            ...plainData,
            createdAt: plainData.created_at,
            updatedAt: plainData.updated_at,
        }) as Entity;
    }

    async list(cond: CondDTO, paging: PagingDTO): Promise<Entity[]> {
        const { page, limit } = paging;
        const condSQL = { status: { [Op.ne]: ModelStatus.DELETED } };
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const total = await model.count({ where: condSQL });
        paging.total = total;
        const rows = await model.findAll({
            where: condSQL,
            offset: (page - 1) * limit,
            limit: limit,
        });
        return rows.map(row => {
            const plainData = row.get({ plain: true });
            return ({
                ...plainData,
                createdAt: plainData.created_at,
                updatedAt: plainData.updated_at,
            }) as Entity;
        });
    }

    async insert(data: Entity): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.create(data as any);
        return true;
    }

    async update(id: string, data: UpdateDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.update(data as any, { where: { id } });
        return true;
    }

    async delete(id: string, isHard: boolean = false): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        if (isHard) {
            await model.destroy({ where: { id } });
        } else {
            await model.update({ status: ModelStatus.DELETED }, { where: { id } });
        }
        return true;
    }
}