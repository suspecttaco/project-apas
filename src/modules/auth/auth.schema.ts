import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const LoginSupervisorSchema = z.object({
    correo: z.string().email().openapi({ example: 'admin@sepyc.gob.mx' }),
    contra: z.string().min(6).openapi({ example: 'admin123' }),
}).openapi('LoginSupervisor');

export const LoginDirectorSchema = z.object({
    correo: z.string().email().openapi({ example: 'director@escuela.mx' }),
    contra: z.string().min(6).openapi({ example: 'director123' }),
}).openapi('LoginDirector');

export const TokenResponseSchema = z.object({
    token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiJ9...' }),
}).openapi('TokenResponse');

export type LoginSupervisorDTO = z.infer<typeof LoginSupervisorSchema>;
export type LoginDirectorDTO = z.infer<typeof LoginDirectorSchema>;
export type TokenResponseDTO = z.infer<typeof TokenResponseSchema>;