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
}