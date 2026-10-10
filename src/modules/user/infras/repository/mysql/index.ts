import { Op, Sequelize } from "sequelize";
import { PagingDTO } from "../../../../../share/model/paging";
import { IUserCommandRepository, IUserQueryRepository, IUserRepository } from "../../../interface";
import { User } from "../../../model";
import { UserCondDTO, UserRegistrationDTO, UserUpdateDTO } from "../../../model/dto";
import { ModelStatus } from "../../../../../share/model/base-model";



export class MySQLUserCommandRepository implements IUserCommandRepository {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async insert(data: UserRegistrationDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.create(data);
        return true;
    }

    async update(id: string, data: UserUpdateDTO): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.update(data, { where: { id } });
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

export class MySQLUserQueryRepository implements IUserQueryRepository {

    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async get(id: string): Promise<User | null> {
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
        } as User;
    }

    async findByEmail(email: string): Promise<User | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findOne({ where: { email } });
        if (!data) {
            return null;
        }
        const plainData = data.get({ plain: true });
        const { created_at, updated_at, ...props } = plainData;
        return {
            ...props,
            createdAt: created_at,
            updatedAt: updated_at,
        } as User;
    }

    async list(cond: UserCondDTO, paging: PagingDTO): Promise<User[]> {
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