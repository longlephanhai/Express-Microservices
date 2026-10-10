import z from "zod";

export const PagingDTOSchema = z.object({
    page: z.coerce.number().int().min(1).default(1), // (coerce) cho phep auto cast tu string sang number 
    limit: z.coerce.number().int().min(1).max(100).default(10),
    total: z.coerce.number().int().min(0).default(0).optional(),
});

export type PagingDTO = z.infer<typeof PagingDTOSchema>;