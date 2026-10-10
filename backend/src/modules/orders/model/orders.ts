import { z } from "zod";

export const OrderStatus = ["pending", "confirmed", "processing", "shipping", "delivered", "completed", "canceled", "refunded", "deleted"] as const;
export const PaymentStatus = ["pending", "paid", "failed"] as const;
export const ShippingMethod = ["free", "standard"] as const;
export const PaymentMethod = ["cod", "zalo"] as const;

export const OrderSchema = z.object({
  id: z.string().uuid(), user_id: z.string().uuid(), shipping_address: z.string(),
  shipping_city: z.string().nullable().optional(), shipping_method: z.enum(ShippingMethod).nullable().optional(),
  payment_method: z.enum(PaymentMethod).nullable().optional(), payment_status: z.enum(PaymentStatus),
  recipient_first_name: z.string().nullable().optional(), recipient_last_name: z.string().nullable().optional(),
  recipient_phone: z.string().nullable().optional(), recipient_email: z.string().nullable().optional(),
  tracking_number: z.string().nullable().optional(), status: z.enum(OrderStatus).nullable().optional(),
  created_at: z.date().optional(), updated_at: z.date().optional(),
});
export type Order = z.infer<typeof OrderSchema>;
