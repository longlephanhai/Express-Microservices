import { z } from "zod";
import { Order, OrderStatus, PaymentStatus, ShippingMethod, PaymentMethod } from "./orders";

export const OrderCreateDTOSchema = z.object({
  user_id: z.string().uuid(), shipping_address: z.string().min(1).max(255),
  shipping_city: z.string().max(80).nullable().optional(), shipping_method: z.enum(ShippingMethod).optional(),
  payment_method: z.enum(PaymentMethod).nullable().optional(), payment_status: z.enum(PaymentStatus).optional(),
  recipient_first_name: z.string().max(80).nullable().optional(), recipient_last_name: z.string().max(80).nullable().optional(),
  recipient_phone: z.string().max(50).nullable().optional(), recipient_email: z.string().email().max(50).nullable().optional(),
  tracking_number: z.string().max(15).nullable().optional(), status: z.enum(OrderStatus).optional(),
});
export const OrderUpdateDTOSchema = OrderCreateDTOSchema.partial().omit({ user_id: true });
export type OrderCreateDTO = z.infer<typeof OrderCreateDTOSchema>;
export type OrderUpdateDTO = z.infer<typeof OrderUpdateDTOSchema>;
export type OrderCondDTO = Partial<Pick<Order, "user_id" | "status" | "payment_status" | "tracking_number">>;
