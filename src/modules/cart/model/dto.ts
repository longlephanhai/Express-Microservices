import z from "zod";

export const CartCreateSchema = z.object({
    userId: z.string().min(1),
    productId: z.string().min(1),
    attribute: z.string(),
    quantity: z.number().int().positive(),
});

export type CartCreateDTO = z.infer<typeof CartCreateSchema>;

export const CartUpdateSchema = z.object({
    quantity: z.number().int().positive(),
});

export type CartUpdateDTO = z.infer<typeof CartUpdateSchema>;

export const CartCondDTOSchema = z.object({
    userId: z.string().min(1),
    productId: z.string().min(1).optional(),
});

export type CartCondDTO = z.infer<typeof CartCondDTOSchema>;