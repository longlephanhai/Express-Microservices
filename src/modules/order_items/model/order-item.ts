import { z } from "zod";
export const OrderItemSchema = z.object({ id: z.string().uuid(), order_id: z.string().uuid(), product_id: z.string().uuid(), attribute: z.string().min(1).max(80), image: z.string().max(200).nullable().optional(), name: z.string().max(150).nullable().optional(), quantity: z.number().int().positive(), price: z.union([z.number().nonnegative(), z.string()]) });
export type OrderItem = z.infer<typeof OrderItemSchema>;
