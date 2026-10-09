
import z from "zod";
import {
    ErrProductIdMustBeValidUUID,
    ErrRatingMustBeIntegerBetween1And5,
    ErrCommentMustNotExceed2000Characters,
} from "./error";

export const CreateProductRatingDTOSchema = z.object({
    productId: z.string().uuid(ErrProductIdMustBeValidUUID),

    rating: z.number()
        .int(ErrRatingMustBeIntegerBetween1And5)
        .min(1, ErrRatingMustBeIntegerBetween1And5)
        .max(5, ErrRatingMustBeIntegerBetween1And5),

    comment: z.string()
        .max(2000, ErrCommentMustNotExceed2000Characters)
        .nullable()
        .optional(),
});

export type CreateProductRatingDTO =
    z.infer<typeof CreateProductRatingDTOSchema>;

export const UpdateProductRatingDTOSchema = z.object({
    rating: z.number()
        .int(ErrRatingMustBeIntegerBetween1And5)
        .min(1, ErrRatingMustBeIntegerBetween1And5)
        .max(5, ErrRatingMustBeIntegerBetween1And5)
        .optional(),

    comment: z.string()
        .max(2000, ErrCommentMustNotExceed2000Characters)
        .nullable()
        .optional(),
}).refine(
    (data) => data.rating !== undefined || data.comment !== undefined,
    {
        message: "At least one field must be provided for update",
    }
);

export type UpdateProductRatingDTO =
    z.infer<typeof UpdateProductRatingDTOSchema>;
