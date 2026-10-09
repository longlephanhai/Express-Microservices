import { pbkdf2, randomBytes } from "node:crypto";
import { v7 } from "uuid";
import { z } from "zod";
import { PagingDTO } from "../../../share/model/paging";
import { IUserIdentityCommandRepository, IUserIdentityQueryRepository, IUserIdentityUseCase } from "../interface";
import { UserIdentityCondDTO, UserIdentityCondSchema, UserIdentityCreateDTO, UserIdentityCreateSchema, UserIdentityUpdateDTO, UserIdentityUpdateSchema } from "../model/dto";
import { ErrUserIdentityNotFound, ErrUserIdentityPasswordRequired } from "../model/error";
import { PublicUserIdentity, UserIdentity, UserIdentityStatus, UserIdentityType, UserIdentityUpdateData } from "../model/user-identity";

const PASSWORD_HASH_ITERATIONS = 120_000;
const PASSWORD_HASH_BYTES = 32;

export class UserIdentityUseCase implements IUserIdentityUseCase {
    constructor(
        private readonly queryRepository: IUserIdentityQueryRepository,
        private readonly commandRepository: IUserIdentityCommandRepository,
    ) { }

    async createUserIdentity(data: UserIdentityCreateDTO): Promise<string> {
        const dto = UserIdentityCreateSchema.parse(data);
        let password: string | null = null;
        let salt: string | null = null;

        if (dto.type === UserIdentityType.EMAIL_PASSWORD) {
            if (!dto.password) {
                throw ErrUserIdentityPasswordRequired;
            }
            salt = randomBytes(32).toString("base64");
            password = await this.hashPassword(dto.password, salt);
        }

        const now = new Date();
        const identity: UserIdentity = {
            id: v7(),
            userId: dto.userId,
            identifier: dto.identifier,
            password,
            salt,
            type: dto.type,
            status: UserIdentityStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
        };
        await this.commandRepository.insert(identity);
        return identity.id;
    }

    async getUserIdentity(id: string): Promise<PublicUserIdentity> {
        const identity = await this.queryRepository.get(id);
        if (!identity || identity.status === UserIdentityStatus.DELETED) {
            throw ErrUserIdentityNotFound;
        }
        return this.toPublicIdentity(identity);
    }

    async listUserIdentities(cond: UserIdentityCondDTO, paging: PagingDTO): Promise<PublicUserIdentity[]> {
        const parsedCondition = UserIdentityCondSchema.parse(cond);
        const identities = await this.queryRepository.list(parsedCondition, paging);
        return identities.map(identity => this.toPublicIdentity(identity));
    }

    async updateUserIdentity(id: string, data: UserIdentityUpdateDTO): Promise<boolean> {
        const dto = UserIdentityUpdateSchema.parse(data);
        const identity = await this.queryRepository.get(id);
        if (!identity || identity.status === UserIdentityStatus.DELETED) {
            throw ErrUserIdentityNotFound;
        }
        if (dto.identifier && identity.type === UserIdentityType.EMAIL_PASSWORD && !z.string().email().safeParse(dto.identifier).success) {
            throw new Error("Identifier must be a valid email address");
        }

        const update: UserIdentityUpdateData = {};
        if (dto.identifier !== undefined) {
            update.identifier = dto.identifier;
        }
        if (dto.status !== undefined) {
            update.status = dto.status;
        }
        if (dto.password !== undefined) {
            if (identity.type !== UserIdentityType.EMAIL_PASSWORD) {
                throw new Error("Password is only valid for email/password identities");
            }
            const salt = randomBytes(32).toString("base64");
            update.salt = salt;
            update.password = await this.hashPassword(dto.password, salt);
        }
        return this.commandRepository.update(id, update);
    }

    async deleteUserIdentity(id: string): Promise<boolean> {
        const identity = await this.queryRepository.get(id);
        if (!identity || identity.status === UserIdentityStatus.DELETED) {
            throw ErrUserIdentityNotFound;
        }
        return this.commandRepository.delete(id);
    }

    private toPublicIdentity(identity: UserIdentity): PublicUserIdentity {
        return {
            id: identity.id,
            userId: identity.userId,
            identifier: identity.identifier,
            type: identity.type,
            status: identity.status,
            createdAt: identity.createdAt,
            updatedAt: identity.updatedAt,
        };
    }

    private hashPassword(password: string, salt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            pbkdf2(password, salt, PASSWORD_HASH_ITERATIONS, PASSWORD_HASH_BYTES, "sha256", (error, derivedKey) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(derivedKey.toString("hex"));
            });
        });
    }
}

