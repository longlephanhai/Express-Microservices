import { v7 } from "uuid";
import { IRepository } from "../../../share/interface";
import { PagingDTO } from "../../../share/model/paging";
import { IBrandUseCase } from "../interface";
import { Brand } from "../model/brand";
import { BrandCreateDTO, BrandCondDTO, BrandUpdateDTO, BrandCreateDTOSchema } from "../model/dto";
import { ModelStatus } from "../../../share/model/base-model";
import { ErrBrandNameDuplicate } from "../model/error";

export class BrandUseCase implements IBrandUseCase {

    constructor(private readonly repository: IRepository<Brand, BrandCondDTO, BrandUpdateDTO>) { }

    async createNewBrand(data: BrandCreateDTO): Promise<string> {
       
        return '';
    }

    getDetailBrand(id: string): Promise<Brand | null> {
        throw new Error("Method not implemented.");
    }
    listBrands(cond: BrandCondDTO, paging: PagingDTO): Promise<Brand[]> {
        throw new Error("Method not implemented.");
    }
    updateBrand(id: string, data: BrandUpdateDTO): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    deleteBrand(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}