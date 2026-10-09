
import { randomUUID } from "node:crypto";

import type {
    ProductRatingRepository,
} from "../../../interface";

import type {
    ProductRating,
} from "../../../model/product_ratings";

import type {
    CreateProductRatingDTO,
    UpdateProductRatingDTO,
} from "../../../model/dto";

import type { PagingDTO } from "../../../../../share/model/paging";

import { ProductRatingPersistence } from "./dto";

export class MySQLProductRatingRepository
    implements ProductRatingRepository {

    private toProductRating(record: ProductRatingPersistence): ProductRating {
        const raw = record.get({ plain: true }) as Record<string, unknown>;

        return {
            id: String(raw.id),
            productId: String(raw.productId),
            userId: String(raw.userId),
            rating: Number(raw.rating),
            comment: (raw.comment ?? null) as string | null,
            createdAt: new Date(
                (raw.createdAt ?? raw.created_at) as string | number | Date,
            ),
            updatedAt: new Date(
                (raw.updatedAt ?? raw.updated_at) as string | number | Date,
            ),
        };
    }

    async create(
        userId: string,
        data: CreateProductRatingDTO,
    ): Promise<ProductRating> {
        const record = await ProductRatingPersistence.create({
            id: randomUUID(),
            productId: data.productId,
            userId,
            rating: data.rating,
            comment: data.comment ?? null,
        });

        return this.toProductRating(record);
    }

    async findById(id: string): Promise<ProductRating | null> {
        const record = await ProductRatingPersistence.findByPk(id);

        if (!record) {
            return null;
        }

        return this.toProductRating(record);
    }

    async findByProductId(
        productId: string,
        paging: PagingDTO,
    ): Promise<ProductRating[]> {
        const offset = (paging.page - 1) * paging.limit;

        const records = await ProductRatingPersistence.findAll({
            where: { productId },
            order: [["created_at", "DESC"]],
            limit: paging.limit,
            offset,
        });

        return records.map((record) => this.toProductRating(record));
    }

    async findByUserId(
        userId: string,
        paging: PagingDTO,
    ): Promise<ProductRating[]> {
        const offset = (paging.page - 1) * paging.limit;

        const records = await ProductRatingPersistence.findAll({
            where: { userId },
            order: [["created_at", "DESC"]],
            limit: paging.limit,
            offset,
        });

        return records.map((record) => this.toProductRating(record));
    }

    async update(
        id: string,
        userId: string,
        data: UpdateProductRatingDTO,
    ): Promise<ProductRating | null> {
        const values: {
            rating?: number;
            comment?: string | null;
        } = {};

        if (data.rating !== undefined) {
            values.rating = data.rating;
        }

        if (data.comment !== undefined) {
            values.comment = data.comment;
        }

        const [affectedRows] = await ProductRatingPersistence.update(
            values,
            {
                where: { id, userId },
            },
        );

        if (affectedRows === 0) {
            return null;
        }

        return this.findById(id);
    }

    async delete(
        id: string,
        userId: string,
    ): Promise<boolean> {
        const deletedRows = await ProductRatingPersistence.destroy({
            where: { id, userId },
        });

        return deletedRows > 0;
    }
}
