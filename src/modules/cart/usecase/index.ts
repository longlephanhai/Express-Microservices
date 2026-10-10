import { v7 } from "uuid";
import { ICartUseCase, IRepository } from "../interface";
import { CartCondDTO, CartCreateDTO, CartUpdateDTO } from "../model/dto";
import { Cart } from "../model/model";
import { PagingDTO } from "../../../share/model/paging";
import { ErrCartItemNotFound } from "../model/errors";

export class CartUseCase implements ICartUseCase {
    constructor(private readonly repository: IRepository) { }

    async createCartItem(data: CartCreateDTO): Promise<string> {
        const newId = v7();
        const cart: Cart = {
            id: newId,
            userId: data.userId,
            productId: data.productId,
            attribute: data.attribute,
            quantity: data.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.repository.insert(cart);
        return newId;
    }

    async getCartItem(id: string): Promise<Cart | null> {
        const data = await this.repository.get(id);
        if (!data) {
            throw ErrCartItemNotFound;
        }
        return data;
    }

    async listCartItems(cond: CartCondDTO, paging: PagingDTO): Promise<Cart[]> {
        return this.repository.list(cond, paging);
    }

    async updateCartItem(id: string, data: CartUpdateDTO): Promise<boolean> {
        const cart = await this.repository.get(id);
        if (!cart) {
            throw ErrCartItemNotFound;
        }
        return this.repository.update(id, data);
    }

    async deleteCartItem(id: string): Promise<boolean> {
        const cart = await this.repository.get(id);
        if (!cart) {
            throw ErrCartItemNotFound;
        }
        return this.repository.delete(id);
    }
}