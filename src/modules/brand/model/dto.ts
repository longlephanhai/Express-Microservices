import z from "zod";
import { ErrBrandNameTooShort } from "./error";

export const BrandCreateDTOSchema = z.object({
    name: z.string().min(2, ErrBrandNameTooShort.message),
    image: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    tagLine: z.string().nullable().optional(),
});

export type BrandCreateDTO = z.infer<typeof BrandCreateDTOSchema>;



export const BrandUpdateDTOSchema = z.object({
    name: z.string().min(2, ErrBrandNameTooShort.message).optional(),
    image: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    tagLine: z.string().nullable().optional(),
});

export type BrandUpdateDTO = z.infer<typeof BrandUpdateDTOSchema>;

export type BrandCondDTO = {};