import z from "zod";

export enum UserIdentityType {
    EMAIL_PASSWORD = "email_password",
    FACEBOOK = "facebook",
    GOOGLE = "google",
}

export enum UserIdentityStatus {
    ACTIVE = "active",
    PENDING = "pending",
    INACTIVE = "inactive",
    BANNED = "banned",
    DELETED = "deleted",
}

export const UserIdentitySchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    identifier: z.string().min(1).max(150),
    password: z.string().max(100).nullable(),
    salt: z.string().max(50).nullable(),
    type: z.nativeEnum(UserIdentityType),
    status: z.nativeEnum(UserIdentityStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const PublicUserIdentitySchema = UserIdentitySchema.omit({ password: true, salt: true });

export type UserIdentity = z.infer<typeof UserIdentitySchema>;
export type PublicUserIdentity = z.infer<typeof PublicUserIdentitySchema>;
export type UserIdentityUpdateData = Partial<Pick<UserIdentity, "identifier" | "password" | "salt" | "status">>;