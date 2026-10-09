import { Request, Response } from "express";
import { PagingDTOSchema } from "../../../../share/model/paging";
import { IUserIdentityUseCase } from "../../interface";
import { UserIdentityCondSchema, UserIdentityCreateSchema, UserIdentityUpdateSchema } from "../../model/dto";

export class UserIdentityHttpServiceAPI {
    constructor(private readonly useCase: IUserIdentityUseCase) { }

    async createUserIdentityAPI(req: Request, res: Response) {
        const parsed = UserIdentityCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }
        const id = await this.useCase.createUserIdentity(parsed.data);
        return res.status(201).json({ data: { id } });
    }

    async getUserIdentityAPI(req: Request, res: Response) {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid user identity id" });
        }
        const data = await this.useCase.getUserIdentity(id);
        return res.status(200).json({ data });
    }

    async listUserIdentitiesAPI(req: Request, res: Response) {
        const pagingResult = PagingDTOSchema.safeParse(req.query);
        if (!pagingResult.success) {
            return res.status(400).json({ error: pagingResult.error.message });
        }
        const conditionResult = UserIdentityCondSchema.safeParse(req.query);
        if (!conditionResult.success) {
            return res.status(400).json({ error: conditionResult.error.message });
        }
        const paging = pagingResult.data;
        const filter = conditionResult.data;
        const data = await this.useCase.listUserIdentities(filter, paging);
        return res.status(200).json({ data, paging, filter });
    }

    async updateUserIdentityAPI(req: Request, res: Response) {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid user identity id" });
        }
        const parsed = UserIdentityUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }
        const data = await this.useCase.updateUserIdentity(id, parsed.data);
        return res.status(200).json({ data });
    }

    async deleteUserIdentityAPI(req: Request, res: Response) {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid user identity id" });
        }
        const data = await this.useCase.deleteUserIdentity(id);
        return res.status(200).json({ data });
    }
}