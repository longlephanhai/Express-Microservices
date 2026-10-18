import { v7 } from "uuid";
import { PagingDTO } from "../../../share/model/paging";
import { IUserCommandRepository, IUserQueryRepository, IUserUseCase } from "../interface";
import { Gender, Role, Status, User } from "../model";
import { UserLoginDTO, UserRegistrationDTO, UserCondDTO, UserUpdateDTO, UserRegistrationDTOSchema, UserLoginDTOSchema } from "../model/dto";
import bcrypt from "bcryptjs";
import { ErrInvalidEmailAndPassword, ErrUserInactivated } from "../model/error";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
export class UserUseCase implements IUserUseCase {

    constructor(
        private readonly userQueryRepository: IUserQueryRepository,
        private readonly userCommandRepository: IUserCommandRepository
    ) { }

    async login(data: UserLoginDTO): Promise<string | null> {
        const dto = UserLoginDTOSchema.parse(data);

        const user = await this.userQueryRepository.findByEmail(dto.email);
        if (!user) {
            throw ErrInvalidEmailAndPassword;
        }

        const isPasswordValid = bcrypt.compareSync(dto.password, user.password);
        if (!isPasswordValid) {
            throw ErrInvalidEmailAndPassword;
        }

        if (user.status === Status.DELETED || user.status === Status.INACTIVE) {
            throw ErrUserInactivated;
        }

        const role = user.role === Role.ADMIN ? Role.ADMIN : Role.USER;
        const jwtSecret = process.env.JWT_SECRET!;
        const expiresIn = process.env.EXPIRATION_TIME as SignOptions['expiresIn'];

        const token = jwt.sign(
            {
                sub: user.id,
                role
            },
            jwtSecret,
            {
                expiresIn
            }
        );

        return token;

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
    async getDetailUser(id: string): Promise<User | null> {
        const user = await this.userQueryRepository.get(id);
        if (!user || user.status === Status.DELETED) {
            return null;
        }
        const { password, salt, ...safeUser } = user;
        return safeUser as User;
    }
    async listUsers(cond: UserCondDTO, paging: PagingDTO): Promise<User[]> {
        return await this.userQueryRepository.list(cond, paging);
    }

    async updateUser(id: string, data: UserUpdateDTO): Promise<boolean> {
        const user = await this.userQueryRepository.get(id);
        if (!user || user.status === Status.DELETED) {
            throw new Error("User not found");
        }

        const updateData: Record<string, any> = { ...data };
        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            updateData.salt = salt;
            updateData.password = bcrypt.hashSync(data.password, salt);
        }

        return await this.userCommandRepository.update(id, updateData);
    }

    async deleteUser(id: string): Promise<boolean> {
        const user = await this.userQueryRepository.get(id);
        if (!user || user.status === Status.DELETED) {
            throw new Error("User not found");
        }
        return await this.userCommandRepository.delete(id, false);
    }
}