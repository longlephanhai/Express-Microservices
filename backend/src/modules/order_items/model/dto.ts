import { z } from "zod";
export const OrderItemCreateDTOSchema = z.object({ order_id: z.string().uuid(), product_id: z.string().uuid(), attribute: z.string().min(1).max(80), image: z.string().max(200).nullable().optional(), name: z.string().max(150).nullable().optional(), quantity: z.coerce.number().int().positive(), price: z.coerce.number().nonnegative() });
export const OrderItemUpdateDTOSchema = z.object({ attribute: z.string().min(1).max(80).optional(), image: z.string().max(200).nullable().optional(), name: z.string().max(150).nullable().optional(), quantity: z.coerce.number().int().positive().optional(), price: z.coerce.number().nonnegative().optional() });
export type OrderItemCreateDTO = z.infer<typeof OrderItemCreateDTOSchema>;
export type OrderItemUpdateDTO = z.infer<typeof OrderItemUpdateDTOSchema>;
