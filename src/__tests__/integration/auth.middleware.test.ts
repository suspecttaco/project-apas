import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector, tokenSupervisor, UUID_ESC } from './setup';
import { UUID_ROL_ADMIN, UUID_ROL_DIRECTOR } from '../mocks/permissions.mock';

beforeEach(() => {
  mockReset(mockPrisma);
});

const usuarioAdmin = {
  id:     'uuid-admin',
  idRol:  UUID_ROL_ADMIN,
  idEsc:  null,
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
};

const usuarioDirectorBase = {
  id:     'uuid-director',
  idRol:  UUID_ROL_DIRECTOR,
  idEsc:  UUID_ESC,
  activo: true,
  fCre:   new Date(),
  fMod:   new Date(),
};

describe('authMiddleware — validación contra BD', () => {

  it('pasa si el usuario existe y está activo', async () => {
    // tokenAdmin() registra Once el usuario válido para el middleware
    const token = tokenAdmin();
    mockPrisma.escuela.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('retorna 401 si el usuario fue desactivado', async () => {
    // Generamos el token pero sobreescribimos el Once con null
    // — simula que el usuario fue desactivado después de emitir el token
    const token = jwt_sign_only(UUID_ROL_ADMIN, 'uuid-admin');
    mockPrisma.usuario.findFirst.mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Sesion invalida o usuario desactivado');
  });

  it('retorna 401 con token completamente inválido', async () => {
    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token invalido o expirado');
  });

  it('retorna 401 sin token', async () => {
    const res = await request(app).get('/api/escuelas');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No autorizado - token requerido');
  });

  it('refleja cambio de rol en caliente — idRol se toma de BD', async () => {
    // Token de admin pero BD devuelve director (sin escuelas:read)
    const token = jwt_sign_only(UUID_ROL_ADMIN, 'uuid-admin');
    mockPrisma.usuario.findFirst.mockResolvedValueOnce({
      ...usuarioDirectorBase,
      idEsc: null, // director sin escuela asignada — no pasa escuelaMiddleware de todos modos
    } as any);
    mockPrisma.escuela.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', `Bearer ${token}`);

    // El rol real es director, que no tiene escuelas:read → 403
    expect(res.status).toBe(403);
  });

  it('refleja cambio de escuela en caliente — idEsc se toma de BD', async () => {
    const OTRA_ESC = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // Token apunta a UUID_ESC pero BD ya tiene otra escuela asignada
    const token = jwt_sign_only(UUID_ROL_DIRECTOR, 'uuid-director', UUID_ESC);
    mockPrisma.usuario.findFirst.mockResolvedValueOnce({
      ...usuarioDirectorBase,
      idEsc: OTRA_ESC,
    } as any);
    mockPrisma.turno.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/turnos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(mockPrisma.turno.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ idEsc: OTRA_ESC }),
      })
    );
  });
});

// Helper interno: genera solo el JWT sin tocar el mock
// Úsalo cuando necesites controlar manualmente lo que devuelve el middleware
function jwt_sign_only(idRol: string, id: string, idEsc?: string): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id, idRol, ...(idEsc && { idEsc }) },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}