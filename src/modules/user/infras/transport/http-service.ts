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
        const result = await this.userUseCase.register(data);
        res.status(201).json({
            data: result
        });
    }
}