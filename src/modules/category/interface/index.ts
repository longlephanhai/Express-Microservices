import { PagingDTO } from "../../../share/model/paging";
import { CategoryCondDTO, CategoryUpdateDTO } from "../model/dto";
import { Category } from "../model/model";

export interface IUseCase { }


export interface IRepository extends IqueryRepository, ICommandRepository { }

export interface IqueryRepository {
    get(id: string): Promise<Category | null>;
    list(cond: CategoryCondDTO, paging: PagingDTO): Promise<Category[]>;
}

export interface ICommandRepository {
    insert(data: Category): Promise<void>;
    update(id: string, data: CategoryUpdateDTO): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}
