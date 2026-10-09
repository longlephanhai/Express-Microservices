import { v7 } from "uuid";
import { ModelStatus } from "../../../share/model/base-model";
import { PagingDTO } from "../../../share/model/paging";
import { IImageRepository, IImageUseCase } from "../interface";
import { ImageCondDTO, ImageCreateDTO, ImageUpdateDTO } from "../model/dto";
import { ErrImageNotFound } from "../model/errors";
import { Image } from "../model/model";

export class ImageUseCase implements IImageUseCase {
    constructor(private readonly repository: IImageRepository) { }

    async createImage(data: ImageCreateDTO): Promise<string> {
        const id = v7();
        const image: Image = {
            ...data,
            id,
            status: ModelStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.repository.insert(image);
        return id;
    }

    async getImage(id: string): Promise<Image> {
        const image = await this.repository.get(id);
        if (!image || image.status === ModelStatus.DELETED) {
            throw ErrImageNotFound;
        }
        return image;
    }

    listImages(cond: ImageCondDTO, paging: PagingDTO): Promise<Image[]> {
        return this.repository.list(cond, paging);
    }

    async updateImage(id: string, data: ImageUpdateDTO): Promise<boolean> {
        await this.getImage(id);
        return this.repository.update(id, data);
    }

    async deleteImage(id: string): Promise<boolean> {
        await this.getImage(id);
        return this.repository.delete(id);
    }
}