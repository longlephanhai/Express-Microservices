import z from "zod";
import { ModelStatus } from "../../../share/model/base-model";

export const ImageSchema = z.object({
    id: z.string().uuid(),
    url: z.string().min(1),
    altText: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.nativeEnum(ModelStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Image = z.infer<typeof ImageSchema>;