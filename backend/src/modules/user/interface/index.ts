import { PagingDTO } from "../../../share/model/paging";
import { User } from "../model";
import { UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO } from "../model/dto";

export interface IUserUseCase {
    login(data: UserLoginDTO): Promise<string | null>;
    register(data: UserRegistrationDTO): Promise<string | null>;
    verifyToken(token: string): Promise<boolean>;

    createNewUser(data: UserRegistrationDTO): Promise<string | null>;
    getDetailUser(id: string): Promise<User | null>;
    listUsers(cond: UserCondDTO, paging: PagingDTO): Promise<User[]>;
    updateUser(id: string, data: UserUpdateDTO): Promise<boolean>;
    deleteUser(id: string): Promise<boolean>;
}


export interface IUserRepository extends IUserQueryRepository, IUserCommandRepository { }

export interface IUserQueryRepository {
    get(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    list(cond: UserCondDTO, paging: PagingDTO): Promise<User[]>;
}

export interface IUserCommandRepository {
    insert(data: UserRegistrationDTO): Promise<boolean>;
    update(id: string, data: UserUpdateDTO): Promise<boolean>;
    delete(id: string, isHard: boolean): Promise<boolean>;
}