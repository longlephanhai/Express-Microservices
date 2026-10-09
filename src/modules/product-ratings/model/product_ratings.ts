
import z from "zod";
import {
  ErrRatingMustBeIntegerBetween1And5,
  ErrProductIdMustBeValidUUID,
  ErrUserIdMustBeValidUUID,
} from "./error";

export const ProductRatingSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(ErrProductIdMustBeValidUUID),
  userId: z.string().uuid(ErrUserIdMustBeValidUUID),
  rating: z.number().int(ErrRatingMustBeIntegerBetween1And5)
    .min(1, ErrRatingMustBeIntegerBetween1And5)
    .max(5, ErrRatingMustBeIntegerBetween1And5),
  comment: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductRating = z.infer<typeof ProductRatingSchema>;
