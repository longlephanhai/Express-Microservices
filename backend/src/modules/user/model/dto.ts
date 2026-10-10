import z from "zod";
import { Gender, Role, Status, userSchema } from ".";
import { 
    ErrBirthdayInvalid, 
    ErrEmailInvalid, 
    ErrFirstNameAtLeast2Chars, 
    ErrGenderInvalid, 
    ErrLastNameAtLeast2Chars, 
    ErrPasswordAtLeast6Chars, 
    ErrRoleInvalid 
} from "./error";

export const UserRegistrationDTOSchema = userSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    password: true
});

export type UserRegistrationDTO = z.infer<typeof UserRegistrationDTOSchema>;

export const UserLoginDTOSchema = userSchema.pick({
    email: true,
    password: true
});

export type UserLoginDTO = z.infer<typeof UserLoginDTOSchema>;

export const userUpdateDTOSchema = z.object({
    avatar: z.string().nullable().optional(),
    firstName: z.string().min(2, ErrFirstNameAtLeast2Chars.message).optional(),
    lastName: z.string().min(2, ErrLastNameAtLeast2Chars.message).optional(),
    email: z.string().email(ErrEmailInvalid.message).optional(),
    password: z.string().min(6, ErrPasswordAtLeast6Chars.message).optional(),
    salt: z.string().min(8).optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    birthday: z.date({ message: ErrBirthdayInvalid.message }).nullable().optional(),
    gender: z.nativeEnum(Gender, { message: ErrGenderInvalid.message }).optional(),
    role: z.nativeEnum(Role, { message: ErrRoleInvalid.message }).optional(),
    status: z.nativeEnum(Status).optional()
});

export type UserUpdateDTO = z.infer<typeof userUpdateDTOSchema>;

export const userCondDTOSchema = z.object({
    firstName: z.string().min(2, ErrFirstNameAtLeast2Chars.message).optional(),
    lastName: z.string().min(2, ErrLastNameAtLeast2Chars.message).optional(),
    email: z.string().email(ErrEmailInvalid.message).optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    gender: z.nativeEnum(Gender, { message: ErrGenderInvalid.message }).optional(),
    role: z.nativeEnum(Role, { message: ErrRoleInvalid.message }).optional(),
    status: z.nativeEnum(Status).optional()
});

export type UserCondDTO = z.infer<typeof userCondDTOSchema>;