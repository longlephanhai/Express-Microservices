import { IRepository } from "../../../share/interface";
import { PagingDTO } from "../../../share/model/paging";

import { Brand } from "../model/brand";
import { BrandCondDTO, BrandCreateDTO, BrandUpdateDTO } from "../model/dto";

export interface IBrandUseCase {
    createNewBrand(data: BrandCreateDTO): Promise<string>;
    getDetailBrand(id: string): Promise<Brand | null>;
    listBrands(cond: BrandCondDTO, paging: PagingDTO): Promise<Brand[]>;
    updateBrand(id: string, data: BrandUpdateDTO): Promise<boolean>;
    deleteBrand(id: string): Promise<boolean>;
}





export interface CreateCommannd { // type
    cmd: BrandCreateDTO;
}

export interface GetDetailQuery { // type
    id: string;
}

export interface UpdateCommand { // type
    id: string;
    dto: BrandUpdateDTO;
}



export interface IBrandRepository extends IRepository<Brand, BrandCondDTO, BrandUpdateDTO> { }