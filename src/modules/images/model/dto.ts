import z from "zod";
import { ModelStatus } from "../../../share/model/base-model";

export const ImageCreateSchema = z.object({
    url: z.string().min(1, "Image URL is required."),
    altText: z.string().nullable().optional(),
    description: z.string().max(255).nullable().optional(),
});

export type ImageCreateDTO = z.infer<typeof ImageCreateSchema>;

export const ImageUpdateSchema = ImageCreateSchema.partial();

export type ImageUpdateDTO = z.infer<typeof ImageUpdateSchema>;

export const ImageCondSchema = z.object({
    url: z.string().optional(),
    status: z.nativeEnum(ModelStatus).optional(),
});

export type ImageCondDTO = z.infer<typeof ImageCondSchema>;