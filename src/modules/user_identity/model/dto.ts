import { z } from "zod";
import { PagingDTOSchema } from "../../../share/model/paging";
import { UserIdentityStatus, UserIdentityType } from "./user-identity";

export const UserIdentityCreateSchema = z.object({
    userId: z.string().uuid(),
    identifier: z.string().min(1).max(150),
    password: z.string().min(8).max(100).optional(),
    type: z.nativeEnum(UserIdentityType),
}).superRefine((data, context) => {
    if (data.type === UserIdentityType.EMAIL_PASSWORD) {
        if (!data.password) {
            context.addIssue({ code: "custom", path: ["password"], message: "Password is required for email/password identities" });
        }
        if (!z.string().email().safeParse(data.identifier).success) {
            context.addIssue({ code: "custom", path: ["identifier"], message: "Identifier must be a valid email address" });
        }
    } else if (data.password !== undefined) {
        context.addIssue({ code: "custom", path: ["password"], message: "Password is only valid for email/password identities" });
    }
});

export type UserIdentityCreateDTO = z.infer<typeof UserIdentityCreateSchema>;

export const UserIdentityUpdateSchema = z.object({
    identifier: z.string().min(1).max(150).optional(),
    password: z.string().min(8).max(100).optional(),
    status: z.nativeEnum(UserIdentityStatus).optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field must be provided");

export type UserIdentityUpdateDTO = z.infer<typeof UserIdentityUpdateSchema>;

export const UserIdentityCondSchema = z.object({
    userId: z.string().uuid(),
    identifier: z.string().min(1).max(150).optional(),
    type: z.nativeEnum(UserIdentityType).optional(),
    status: z.nativeEnum(UserIdentityStatus).optional(),
});

export type UserIdentityCondDTO = z.infer<typeof UserIdentityCondSchema>;
export const UserIdentityPagingSchema = PagingDTOSchema;