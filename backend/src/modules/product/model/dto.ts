import { z } from 'zod';
import { ErrBrandIdMustBeValidUUID, ErrCategoryIdMustBeValidUUID, ErrFromPriceMustBePositive, ErrNameMustBeAtLeast2Characters, ErrPriceMustBePositive, ErrQuantityMustBeNonnegative, ErrSalePriceMustBeNonnegative, ErrToPriceMustBePositive } from './error';
import { ProductGender } from './product';

export const ProductCreateSchema = z.object({
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
});

export type ProductCreateDTO = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = z.object({
    name: z.string().min(2, ErrNameMustBeAtLeast2Characters).optional(),
    price: z.number().positive(ErrPriceMustBePositive).optional(),
    salePrice: z.number().nonnegative(ErrSalePriceMustBeNonnegative).optional(),
    quantity: z.number().int().nonnegative(ErrQuantityMustBeNonnegative).optional(),
    brandId: z.string().uuid(ErrBrandIdMustBeValidUUID).optional(),
    categoryId: z.string().uuid(ErrCategoryIdMustBeValidUUID).optional(),
    content: z.string().optional(),
    description: z.string().optional(),
});

export type ProductUpdateDTO = z.infer<typeof ProductUpdateSchema>;

export const ProductCondSchema = z.object({
    fromPrice: z.number().positive(ErrFromPriceMustBePositive).optional(),
    toPrice: z.number().positive(ErrToPriceMustBePositive).optional(),
    brandId: z.string().uuid(ErrBrandIdMustBeValidUUID).optional(),
    categoryId: z.string().uuid(ErrCategoryIdMustBeValidUUID).optional(),
});

export type ProductCondDTO = z.infer<typeof ProductCondSchema>;