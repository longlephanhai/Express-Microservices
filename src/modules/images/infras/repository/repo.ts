import { Op, Sequelize } from "sequelize";
import { PagingDTO } from "../../../../share/model/paging";
import { ModelStatus } from "../../../../share/model/base-model";
import { IImageRepository } from "../../interface";
import { ImageCondDTO, ImageUpdateDTO } from "../../model/dto";
import { Image, ImageSchema } from "../../model/model";
import { modelName } from "./dto";

export class MySQLImageRepository implements IImageRepository {
    constructor(private readonly sequelize: Sequelize) { }

    async get(id: string): Promise<Image | null> {
        const model = this.sequelize.models[modelName];
        if (!model) {
            throw new Error(`Model ${modelName} not found`);
        }

        const data = await model.findByPk(id);
        return data ? this.toImage(data.get({ plain: true })) : null;
    }

    async list(cond: ImageCondDTO, paging: PagingDTO): Promise<Image[]> {
        const model = this.sequelize.models[modelName];
        if (!model) {
            throw new Error(`Model ${modelName} not found`);
        }

        const where = {
            ...cond,
            status: cond.status ?? { [Op.ne]: ModelStatus.DELETED },
        };
        const { page, limit } = paging;
        paging.total = await model.count({ where });

        const rows = await model.findAll({
            where,
            offset: (page - 1) * limit,
            limit,
        });

        return rows.map(row => this.toImage(row.get({ plain: true })));
    }

    async insert(data: Image): Promise<boolean> {
        const model = this.sequelize.models[modelName];
        if (!model) {
            throw new Error(`Model ${modelName} not found`);
        }

        await model.create(data);
        return true;
    }

    async update(id: string, data: ImageUpdateDTO): Promise<boolean> {
        const model = this.sequelize.models[modelName];
        if (!model) {
            throw new Error(`Model ${modelName} not found`);
        }

        await model.update(data, { where: { id } });
        return true;
    }

    async delete(id: string, isHard: boolean = false): Promise<boolean> {
        const model = this.sequelize.models[modelName];
        if (!model) {
            throw new Error(`Model ${modelName} not found`);
        }

        if (isHard) {
            await model.destroy({ where: { id } });
        } else {
            await model.update({ status: ModelStatus.DELETED }, { where: { id } });
        }
        return true;
    }

    private toImage(data: Record<string, unknown>): Image {
        return ImageSchema.parse({
            ...data,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    }
}