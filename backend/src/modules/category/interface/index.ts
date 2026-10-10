import { PagingDTO } from "../../../share/model/paging";
import { CategoryCondDTO, CategoryCreateDTO, CategoryUpdateDTO } from "../model/dto";
import { Category } from "../model/model";

export interface ICategoryUseCase {
    createNewCategory(data: CategoryCreateDTO): Promise<string>;
    getDetailCategory(id: string): Promise<Category | null>;
    listCategories(cond: CategoryCondDTO, paging: PagingDTO): Promise<Category[]>;
    updateCategory(id: string, data: CategoryUpdateDTO): Promise<boolean>;
    deleteCategory(id: string): Promise<boolean>;
}


export interface IRepository extends IqueryRepository, ICommandRepository { }

export interface IqueryRepository {
    get(id: string): Promise<Category | null>;
    list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Category[]>;
}

export interface ICommandRepository {
    insert(data: Category): Promise<boolean>;
    update(id: string, data: CategoryUpdateDTO): Promise<boolean>;
    delete(id: string, isHard: boolean): Promise<boolean>;
}
