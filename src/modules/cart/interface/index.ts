import { PagingDTO } from "../../../share/model/paging";
import { CartCondDTO, CartCreateDTO, CartUpdateDTO } from "../model/dto";
import { Cart } from "../model/model";

export interface ICartUseCase {
    createCartItem(data: CartCreateDTO): Promise<string>;
    getCartItem(id: string): Promise<Cart | null>;
    listCartItems(cond: CartCondDTO, paging: PagingDTO): Promise<Cart[]>;
    updateCartItem(id: string, data: CartUpdateDTO): Promise<boolean>;
    deleteCartItem(id: string): Promise<boolean>;
}

export interface IRepository extends IQueryRepository, ICommandRepository { }

export interface IQueryRepository {
    get(id: string): Promise<Cart | null>;
    list(cond: CartCondDTO, paging: PagingDTO): Promise<Cart[]>;
}

export interface ICommandRepository {
    insert(data: Cart): Promise<boolean>;
    update(id: string, data: CartUpdateDTO): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}
