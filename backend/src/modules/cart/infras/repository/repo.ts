import { Sequelize } from "sequelize";
import { PagingDTO } from "../../../../share/model/paging";
import { IRepository } from "../../interface";
import { CartCondDTO, CartUpdateDTO } from "../../model/dto";
import { Cart, CartSchema } from "../../model/model";

export class MySQLCartRepository implements IRepository {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async get(id: string): Promise<Cart | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findByPk(id);
        if (!data) {
            return null;
        }

        const plainData = data.get({ plain: true });
        return CartSchema.parse({
            ...plainData,
            createdAt: plainData.createdAt ?? plainData.created_at,
            updatedAt: plainData.updatedAt ?? plainData.updated_at,
        });
    }

    async list(cond: CartCondDTO, paging: PagingDTO): Promise<Cart[]> {
        const { page, limit } = paging;
        const condSQL = {
            userId: cond.userId,
            ...(cond.productId ? { productId: cond.productId } : {}),
        };
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const total = await model.count({ where: condSQL });
        paging.total = total;
        const rows = await model.findAll({
            where: condSQL,
            offset: (page - 1) * limit,
            limit,
        });
        return rows.map(row => {
            const plainData = row.get({ plain: true });
            return CartSchema.parse({
                ...plainData,
                createdAt: plainData.createdAt ?? plainData.created_at,
                updatedAt: plainData.updatedAt ?? plainData.updated_at,
            });
        });
    }

    async insert(data: Cart): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.create(data);
        return true;
    }

    async update(id: string, data: CartUpdateDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.update(data, { where: { id } });
        return true;
    }

    async delete(id: string): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.destroy({ where: { id } });
        return true;
    }
}

