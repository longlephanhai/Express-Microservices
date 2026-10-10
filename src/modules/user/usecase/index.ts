import { v7 } from "uuid";
import { PagingDTO } from "../../../share/model/paging";
import { IUserCommandRepository, IUserQueryRepository, IUserUseCase } from "../interface";
import { Gender, Role, Status, User } from "../model";
import { UserLoginDTO, UserRegistrationDTO, UserCondDTO, UserUpdateDTO, UserRegistrationDTOSchema } from "../model/dto";
import bcrypt from "bcryptjs";

export class UserUseCase implements IUserUseCase {

    constructor(
        private readonly userQueryRepository: IUserQueryRepository,
        private readonly userCommandRepository: IUserCommandRepository
    ) { }

    login(data: UserLoginDTO): Promise<string | null> {
        throw new Error("Method not implemented.");
    }

    async register(data: UserRegistrationDTO): Promise<string | null> {
        const dto = UserRegistrationDTOSchema.parse(data);

        const isExist = await this.userQueryRepository.findByEmail(dto.email);

        if (isExist) {
            throw new Error(`User with email ${dto.email} already exists.`);
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(dto.password, salt);

        const newId = v7();
        const newUser: User = {
            ...dto,
            password: hashPassword,
            id: newId,
            status: Status.ACTIVE,
            gender: Gender.UNKNOWN,
            salt: salt,
            role: Role.USER,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        await this.userCommandRepository.insert(newUser);
        return newId;

    }

    verifyToken(token: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    createNewUser(data: UserRegistrationDTO): Promise<string | null> {
        throw new Error("Method not implemented.");
    }
    getDetailUser(id: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    listUsers(cond: UserCondDTO, paging: PagingDTO): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    updateUser(id: string, data: UserUpdateDTO): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    deleteUser(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}