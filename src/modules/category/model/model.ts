import z from "zod";


export enum CategoryStatus {
    Active = "active",
    Inactive = "inactive",
    Deleted = "deleted",
}



export const CategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, 'name must be at least 3 characters long'),
    image: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    position: z.number().min(0, 'invalid position').default(0),
    parentId: z.string().uuid().nullable(),
    status: z.nativeEnum(CategoryStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Category = z.infer<typeof CategorySchema>;


