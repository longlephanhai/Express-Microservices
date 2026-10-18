import { Request, Response } from "express";
import { IUserUseCase } from "../../interface";
import { UserRegistrationDTOSchema } from "../../model/dto";

export class UserHTTPServiceAPI {
    constructor(
        private readonly userUseCase: IUserUseCase
    ) { }

    async registerUserAPI(req: Request, res: Response) {
        const { success, data, error } = UserRegistrationDTOSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                error: error.message
            });
        }
        try {
            const result = await this.userUseCase.register(data);
            res.status(201).json({
                data: result
            });
        } catch (err) {
            res.status(400).json({
                message: (err as Error).message
            });
        }
    }

    async loginUserAPI(req: Request, res: Response) {
        try {
            const token = await this.userUseCase.login(req.body);
            res.status(200).json({ data: token });
        } catch (error) {
            res.status(400).json({
                message: (error as Error).message,
            });
        }
    }

    async getProfileAPI(req: Request, res: Response) {
        const { userId } = req;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
            const user = await this.userUseCase.getDetailUser(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ data: user });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    async listUsersAPI(req: Request, res: Response) {
        try {
            const paging = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 20,
                total: 0
            };

            const cond: any = {};
            if (req.query.role && req.query.role !== 'all') cond.role = req.query.role;
            if (req.query.status && req.query.status !== 'all') cond.status = req.query.status;
            if (req.query.search && typeof req.query.search === 'string') cond.search = req.query.search;

            const users = await this.userUseCase.listUsers(cond, paging);
            res.status(200).json({
                data: users,
                paging,
                filter: cond
            });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    async getDetailUserAPI(req: Request, res: Response) {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        try {
            const user = await this.userUseCase.getDetailUser(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ data: user });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    async updateUserAPI(req: Request, res: Response) {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        try {
            const result = await this.userUseCase.updateUser(id, req.body);
            res.status(200).json({ data: result });
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }

    async deleteUserAPI(req: Request, res: Response) {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        try {
            const result = await this.userUseCase.deleteUser(id);
            res.status(200).json({ data: result });
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
}