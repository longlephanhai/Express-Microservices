import { Op, Sequelize } from "sequelize";
import { PagingDTO } from "../../../../../share/model/paging";
import { IUserIdentityCommandRepository, IUserIdentityQueryRepository } from "../../../interface";
import { UserIdentityCondDTO } from "../../../model/dto";
import { UserIdentity, UserIdentitySchema, UserIdentityStatus, UserIdentityUpdateData } from "../../../model/user-identity";

function toUserIdentity(value: Record<string, any>): UserIdentity {
    return UserIdentitySchema.parse({
        ...value,
        userId: value.userId ?? value.user_id,
        createdAt: value.createdAt ?? value.created_at,
        updatedAt: value.updatedAt ?? value.updated_at,
    });
}

export class MySQLUserIdentityQueryRepository implements IUserIdentityQueryRepository {
    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async get(id: string): Promise<UserIdentity | null> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const data = await model.findByPk(id);
        return data ? toUserIdentity(data.get({ plain: true })) : null;
    }

    async list(cond: UserIdentityCondDTO, paging: PagingDTO): Promise<UserIdentity[]> {
        const { page, limit } = paging;
        const where = {
            userId: cond.userId,
            status: cond.status ?? { [Op.ne]: UserIdentityStatus.DELETED },
            ...(cond.identifier ? { identifier: cond.identifier } : {}),
            ...(cond.type ? { type: cond.type } : {}),
        };
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }

        paging.total = await model.count({ where });
        const rows = await model.findAll({
            where,
            offset: (page - 1) * limit,
            limit,
            order: [["created_at", "DESC"]],
        });
        return rows.map(row => toUserIdentity(row.get({ plain: true })));
    }
}

export class MySQLUserIdentityCommandRepository implements IUserIdentityCommandRepository {
    constructor(private readonly sequelize: Sequelize, private readonly modelName: string) { }

    async insert(data: UserIdentity): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        await model.create(data);
        return true;
    }

    async update(id: string, data: UserIdentityUpdateData): Promise<boolean> {
        const model = this.sequelize.models[this.modelName];
        if (!model) {
            throw new Error(`Model ${this.modelName} not found`);
        }
        const [updatedRows] = await model.update(data, { where: { id } });
        return updatedRows > 0;
    }

    async delete(id: string): Promise<boolean> {
        return this.update(id, { status: UserIdentityStatus.DELETED });
    }
}
