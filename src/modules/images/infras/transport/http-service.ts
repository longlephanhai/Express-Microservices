import { Request, Response } from "express";
import { PagingDTOSchema } from "../../../../share/model/paging";
import { IImageUseCase } from "../../interface";
import { ImageCondSchema, ImageCreateSchema, ImageUpdateSchema } from "../../model/dto";

export class ImageHttpServiceAPI {
    constructor(private readonly useCase: IImageUseCase) { }

    async createImageAPI(req: Request, res: Response) {
        const { success, data, error} = ImageCreateSchema.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: error.message });
        }

        const result = await this.useCase.createImage(data);
        return res.status(201).json({ data: result });
    }

    async getImageAPI(req: Request, res: Response) {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid image id" });
        }

        const result = await this.useCase.getImage(id);
        return res.status(200).json({ data: result });
    }

    async updateImageAPI(req: Request, res: Response) {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid image id" });
        }

        const { success, data, error } = ImageUpdateSchema.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ error: error.message });
        }

        const result = await this.useCase.updateImage(id, data);
        return res.status(200).json({ data: result });
    }

    async deleteImageAPI(req: Request, res: Response) {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid image id" });
        }

        const result = await this.useCase.deleteImage(id);
        return res.status(200).json({ data: result });
    }

    async listImagesAPI(req: Request, res: Response) {
        const { success: pagingSuccess, data: paging, error: pagingError } = PagingDTOSchema.safeParse(req.query);
        const { success: condSuccess, data: cond, error: condError } = ImageCondSchema.safeParse(req.query);
        if (!pagingSuccess) {
            return res.status(400).json({
                error: pagingError.message,
            });
        }
        if (!condSuccess) {
            return res.status(400).json({ error: condError.message });
        }

        const result = await this.useCase.listImages(cond, paging);
        return res.status(200).json({ data: result, paging, filter: cond });
    }
}