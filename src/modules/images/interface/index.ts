import { PagingDTO } from "../../../share/model/paging";
import { ImageCondDTO, ImageCreateDTO, ImageUpdateDTO } from "../model/dto";
import { Image } from "../model/model";

export interface IImageUseCase {
    createImage(data: ImageCreateDTO): Promise<string>;
    getImage(id: string): Promise<Image>;
    listImages(cond: ImageCondDTO, paging: PagingDTO): Promise<Image[]>;
    updateImage(id: string, data: ImageUpdateDTO): Promise<boolean>;
    deleteImage(id: string): Promise<boolean>;
}

export interface IImageRepository {
    get(id: string): Promise<Image | null>;
    list(cond: ImageCondDTO, paging: PagingDTO): Promise<Image[]>;
    insert(data: Image): Promise<boolean>;
    update(id: string, data: ImageUpdateDTO): Promise<boolean>;
    delete(id: string, isHard?: boolean): Promise<boolean>;
}