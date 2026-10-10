import { Op, Sequelize } from "sequelize";
import { PagingDTO, PagingDTOSchema } from "../../../../share/model/paging";
import { IRepository } from "../../interface";
import { CategoryCondDTO, CategoryUpdateDTO } from "../../model/dto";
import { Category, CategorySchema } from "../../model/model";
import { ModelStatus } from "../../../../share/model/base-model";

export class MySQLCategoryRepository implements IRepository {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async get(id: string): Promise<Category | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findByPk(id);
        if (!data) {
            return null;
        }

        const plainData = data.get({ plain: true });
        return CategorySchema.parse({
            ...plainData,
            children: [],
            createdAt: plainData.created_at,
            updatedAt: plainData.updated_at,
        });
    }

    async list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Category[]> {
        const { page, limit } = paging;
        const condSQL = { status: { [Op.ne]: ModelStatus.DELETED } };
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const total = await model.count({ where: condSQL });
        paging.total = total;
        console.log(`Total categories: ${total}, Page: ${page}, Limit: ${limit}`);
        const rows = await model.findAll({
            where: condSQL,
            offset: (page - 1) * limit,
            limit: limit,
        });
        return rows.map(row => {
            const plainData = row.get({ plain: true });
            return CategorySchema.parse({
                ...plainData,
                createdAt: plainData.created_at,
                updatedAt: plainData.updated_at,
            });
        });
    }

    async insert(data: Category): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.create(data);
        return true;
    }

    async update(id: string, data: CategoryUpdateDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.update(data, { where: { id } });
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

