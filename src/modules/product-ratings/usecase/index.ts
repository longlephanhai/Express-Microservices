
import {
    ErrDuplicateProductRating,
    ErrProductNotFound,
    ErrProductRatingNotFound,
    ErrCannotModifyOtherUsersRating,
} from "../model/error";

import type {
    ProductRating,
} from "../model/product_ratings";

import type {
    CreateProductRatingDTO,
    UpdateProductRatingDTO,
} from "../model/dto";

import type { PagingDTO } from "../../../share/model/paging";

import type {
    ProductRatingRepository,
    ProductService,
} from "../interface";

export class ProductRatingUseCase {
    constructor(
        private readonly repository: ProductRatingRepository,
        private readonly productService: ProductService,
    ) {}

    async create(
        userId: string,
        data: CreateProductRatingDTO,
    ): Promise<ProductRating> {
        const productExists = await this.productService.exists(
            data.productId,
        );

        if (!productExists) {
            throw ErrProductNotFound;
        }

        const existingRatings = await this.repository.findByUserId(
            userId,
            { page: 1, limit: 100 },
        );

        const alreadyRated = existingRatings.some(
            (item) => item.productId === data.productId,
        );

        if (alreadyRated) {
            throw ErrDuplicateProductRating;
        }

        return this.repository.create(userId, data);
    }

    async findById(id: string): Promise<ProductRating> {
        const rating = await this.repository.findById(id);

        if (!rating) {
            throw ErrProductRatingNotFound;
        }

        return rating;
    }

    async findByProductId(
        productId: string,
        paging: PagingDTO,
    ): Promise<ProductRating[]> {
        const productExists = await this.productService.exists(productId);

        if (!productExists) {
            throw ErrProductNotFound;
        }

        return this.repository.findByProductId(productId, paging);
    }

    async findByUserId(
        userId: string,
        paging: PagingDTO,
    ): Promise<ProductRating[]> {
        return this.repository.findByUserId(userId, paging);
    }

    async update(
        id: string,
        userId: string,
        data: UpdateProductRatingDTO,
    ): Promise<ProductRating> {
        const existingRating = await this.repository.findById(id);

        if (!existingRating) {
            throw ErrProductRatingNotFound;
        }

        if (existingRating.userId !== userId) {
            throw ErrCannotModifyOtherUsersRating;
        }

        const updatedRating = await this.repository.update(
            id,
            userId,
            data,
        );

        if (!updatedRating) {
            throw ErrProductRatingNotFound;
        }

        return updatedRating;
    }

    async delete(
        id: string,
        userId: string,
    ): Promise<void> {
        const existingRating = await this.repository.findById(id);

        if (!existingRating) {
            throw ErrProductRatingNotFound;
        }

        if (existingRating.userId !== userId) {
            throw ErrCannotModifyOtherUsersRating;
        }

        const deleted = await this.repository.delete(id, userId);

        if (!deleted) {
            throw ErrProductRatingNotFound;
        }
    }
}
