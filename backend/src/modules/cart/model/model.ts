import z from "zod";

export const CartSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().min(1),
    productId: z.string().min(1),
    attribute: z.string(),
    quantity: z.number().int().positive(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Cart = z.infer<typeof CartSchema>;


