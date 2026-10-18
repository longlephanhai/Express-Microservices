import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  attribute: z.string().max(80).default("default"),
  image: z.string().max(1000).nullable().optional(),
  name: z.string().max(255).nullable().optional(),
  quantity: z.coerce.number().int().positive(),
  price: z.union([z.number().nonnegative(), z.string()]),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderItemCreateDTOSchema = z.object({
  product_id: z.string().uuid(),
  attribute: z.string().max(80).default("default"),
  image: z.string().max(1000).nullable().optional(),
  name: z.string().max(255).nullable().optional(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export type OrderItemCreateDTO = z.infer<typeof OrderItemCreateDTOSchema>;
