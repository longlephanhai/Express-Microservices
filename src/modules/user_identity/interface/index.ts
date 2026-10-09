import { PagingDTO } from "../../../share/model/paging";
import { UserIdentityCondDTO, UserIdentityCreateDTO, UserIdentityUpdateDTO } from "../model/dto";
import { PublicUserIdentity, UserIdentity, UserIdentityUpdateData } from "../model/user-identity";

export interface IUserIdentityUseCase {
    createUserIdentity(data: UserIdentityCreateDTO): Promise<string>;
    getUserIdentity(id: string): Promise<PublicUserIdentity | null>;
    listUserIdentities(cond: UserIdentityCondDTO, paging: PagingDTO): Promise<PublicUserIdentity[]>;
    updateUserIdentity(id: string, data: UserIdentityUpdateDTO): Promise<boolean>;
    deleteUserIdentity(id: string): Promise<boolean>;
}

export interface IUserIdentityQueryRepository {
    get(id: string): Promise<UserIdentity | null>;
    list(cond: UserIdentityCondDTO, paging: PagingDTO): Promise<UserIdentity[]>;
}

export interface IUserIdentityCommandRepository {
    insert(data: UserIdentity): Promise<boolean>;
    update(id: string, data: UserIdentityUpdateData): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}