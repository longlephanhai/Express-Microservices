import z from "zod";
import { ErrBrandIdMustBeValidUUID, ErrCategoryIdMustBeValidUUID, ErrNameMustBeAtLeast2Characters, ErrPriceMustBePositive, ErrQuantityMustBeNonnegative, ErrSalePriceMustBeNonnegative } from "./error";
import { ModelStatus } from "../../../share/model/base-model";

export enum ProductGender {
    MALE = 'male',
    FEMALE = 'female',
    UNISEX = 'unisex'
}

export const ProductSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, ErrNameMustBeAtLeast2Characters),
    gender: z.nativeEnum(ProductGender),
    price: z.number().positive(ErrPriceMustBePositive),
    salePrice: z.number().nonnegative(ErrSalePriceMustBeNonnegative),
    colors: z.string().optional(),
    quantity: z.number().int().nonnegative(ErrQuantityMustBeNonnegative),
    brandId: z.string().uuid(ErrBrandIdMustBeValidUUID).optional(),
    categoryId: z.string().uuid(ErrCategoryIdMustBeValidUUID).optional(),
    content: z.string().optional(),
    description: z.string().optional(),
    rating: z.number().min(0).max(5),
    saleCount: z.number().int().nonnegative(),
    status: z.nativeEnum(ModelStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Product = z.infer<typeof ProductSchema> & { category?: ProductCategory, brand?: ProductBrand };

export const ProductBrandSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, ErrNameMustBeAtLeast2Characters),
});

export type ProductBrand = z.infer<typeof ProductBrandSchema>;

export const ProductCategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, ErrNameMustBeAtLeast2Characters),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;
