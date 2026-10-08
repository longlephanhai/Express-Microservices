import { Op, Sequelize } from "sequelize";
import { PagingDTO } from "../../../../../share/model/paging";
import { IProductCommandRepository, IProductQueryRepository } from "../../../interface";
import { ProductCondDTO, ProductCreateDTO, ProductUpdateDTO } from "../../../model/dto";
import { Product, } from "../../../model/product";
import { ModelStatus } from "../../../../../share/model/base-model";


export class MySQLProductQueryRepository implements IProductQueryRepository {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async get(id: string): Promise<Product | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findByPk(id);
        if (!data) {
            return null;
        }
        const plainData = data.get({ plain: true });
        const { created_at, updated_at, ...props } = plainData;
        return {
            ...props,
            createdAt: created_at,
            updatedAt: updated_at,
        } as Product;
    }

    async list(cond: ProductCondDTO, paging: PagingDTO): Promise<Product[]> {
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
            order: [['id', 'DESC']],
        });
        return rows.map((row) => row.get({ plain: true }));
    }
}

export class MySQLProductCommandRepository implements IProductCommandRepository {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async insert(data: ProductCreateDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.create(data);
        return true;
    }

    async update(id: string, data: ProductUpdateDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const [rowsUpdated] = await model.update(data, { where: { id } });
        return true;
    }

    async delete(id: string, isHard: boolean): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }

        if (!isHard) {
            await model.update({ status: ModelStatus.DELETED }, { where: { id } });
        } else {
            await model.destroy({ where: { id } });
        }
        return true;
    }
}
