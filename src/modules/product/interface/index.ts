import { PagingDTO } from "../../../share/model/paging";
import { ProductCondDTO, ProductCreateDTO, ProductUpdateDTO } from "../model/dto";
import { Product, ProductBrand, ProductCategory } from "../model/product";

// bussiness logic layer
export interface IProductQueryUseCase {
    getDetailProduct(id: string): Promise<Product | null>;
    listProducts(cond: ProductCondDTO, paging: PagingDTO): Promise<Product[]>;
}


export interface IProductCommandUseCase {
    createNewProduct(data: ProductCreateDTO): Promise<string>;
    updateProduct(id: string, data: ProductUpdateDTO): Promise<boolean>;
    deleteProduct(id: string): Promise<boolean>;
}


// repository layer
export interface IProductQueryRepository {
    get(id: string): Promise<Product | null>;
    list(cond: ProductCondDTO, paging: PagingDTO): Promise<Product[]>;
}

export interface IProductCommandRepository {
    insert(data: ProductCreateDTO): Promise<boolean>;
    update(id: string, data: ProductUpdateDTO): Promise<boolean>;
    delete(id: string, isHard: boolean): Promise<boolean>;
}


export interface IBrandQueryRepository {
  get(id: string): Promise<ProductBrand | null>
}

export interface ICategoryQueryRepository {
  get(id: string): Promise<ProductCategory | null>
}