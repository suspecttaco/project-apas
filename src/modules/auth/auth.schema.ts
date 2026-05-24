import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
  correo: z.string().email().openapi({ example: 'usuario@sepyc.gob.mx' }),
  contra: z.string().min(6).openapi({ example: 'contrasena123' }),
}).openapi('Login');

export const TokenResponseSchema = z.object({
  token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiJ9...' }),
}).openapi('TokenResponse');

export type LoginSchema        = z.infer<typeof LoginSchema>;
export type TokenResponseDTO   = z.infer<typeof TokenResponseSchema>;