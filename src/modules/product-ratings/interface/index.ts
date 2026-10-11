
import type { ProductRating, } from "../model/product_ratings";
import type {
    CreateProductRatingDTO,
    UpdateProductRatingDTO,
} from "../model/dto";

import type { PagingDTO } from "../../../share/model/paging";

export interface ProductRatingRepository {
    create(
        userId: string,
        data: CreateProductRatingDTO,
    ): Promise<ProductRating>;

    findById(
        id: string,
    ): Promise<ProductRating | null>;

    findByProductId(
        productId: string,
        paging: PagingDTO,
    ): Promise<ProductRating[]>;

    findByUserId(
        userId: string,
        paging: PagingDTO,
    ): Promise<ProductRating[]>;

    update(
        id: string,
        userId: string,
        data: UpdateProductRatingDTO,
    ): Promise<ProductRating | null>;

    delete(
        id: string,
        userId: string,
    ): Promise<boolean>;
}

export interface ProductService {
    exists(
        productId: string,
    ): Promise<boolean>;
}
