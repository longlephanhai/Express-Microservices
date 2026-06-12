import z = require("zod");
import { CategoryStatus } from "./model";



export const CategoryCreateSchema = z.object({
    name: z.string().min(3, "Name is required and cannot be empty."),
    image: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
});

export type CategoryCreateDTO = z.infer<typeof CategoryCreateSchema>;


export const CategoryUpdateSchema = z.object({
    name: z.string().min(3, "Name is required and cannot be empty.").optional(),
    image: z.string().nullable().optional(),
    description: z.string().max(255, "Description cannot exceed 255 characters.").nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    status: z.nativeEnum(CategoryStatus).optional(),
})

export type CategoryUpdateDTO = z.infer<typeof CategoryUpdateSchema>;

