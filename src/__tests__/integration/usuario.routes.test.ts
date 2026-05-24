import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenDirector, UUID_ESC } from './setup';
import { UUID_ROL_ADMIN, UUID_ROL_DIRECTOR } from '../mocks/permissions.mock';

const rolAdmin = {
  id:              UUID_ROL_ADMIN,
  nombre:          'admin',
  desc:            null,
  requiereEscuela: false,
  activo:          true,
  fCre:            new Date(),
  fMod:            new Date(),
};

const rolDirector = {
  id:              UUID_ROL_DIRECTOR,
  nombre:          'director',
  desc:            null,
  requiereEscuela: true,
  activo:          true,
  fCre:            new Date(),
  fMod:            new Date(),
};

const usuarioBase = {
  id:      'uuid-usuario',
  idRol:   UUID_ROL_ADMIN,
  idEsc:   null,
  nombre:  'Juan Perez',
  correo:  'juan@sepyc.gob.mx',
  contra:  'hash',
  activo:  true,
  fCre:    new Date(),
  fMod:    new Date(),
  rol:     rolAdmin,
  escuela: null,
};

const escuelaBase = {
  id:     UUID_ESC,
  nombre: 'Secundaria Test',
  activo: true,
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/usuarios', () => {

  it('debe retornar 200 con lista de usuarios para admin', async () => {
    mockPrisma.usuario.findMany.mockResolvedValue([usuarioBase] as any);

    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(403);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/usuarios/:id', () => {

  it('debe retornar 200 con el usuario encontrado', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);

    const res = await request(app)
      .get('/api/usuarios/uuid-usuario')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.correo).toBe('juan@sepyc.gob.mx');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/usuarios/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/usuarios', () => {

  it('debe retornar 201 al crear usuario admin correctamente', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null);
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolAdmin as any);
    mockPrisma.usuario.create.mockResolvedValue(usuarioBase as any);

    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre: 'Juan Perez',
        correo: 'juan@sepyc.gob.mx',
        contra: 'contrasena123',
        idRol:  UUID_ROL_ADMIN,
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 201 al crear usuario director con escuela', async () => {
    const usuarioDirector = { ...usuarioBase, idRol: UUID_ROL_DIRECTOR, idEsc: UUID_ESC, rol: rolDirector };

    mockPrisma.usuario.findFirst.mockResolvedValue(null);
    mockPrisma.rolUsuario.findFirst.mockResolvedValue(rolDirector as any);
    mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase as any);
    mockPrisma.usuario.create.mockResolvedValue(usuarioDirector as any);

    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre: 'Juan Perez',
        correo: 'juan@sepyc.gob.mx',
        contra: 'contrasena123',
        idRol:  UUID_ROL_DIRECTOR,
        idEsc:  UUID_ESC,
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si el correo ya esta registrado', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);

    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre: 'Otro',
        correo: 'juan@sepyc.gob.mx',
        contra: 'contrasena123',
        idRol:  UUID_ROL_ADMIN,
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Juan' });

    expect(res.status).toBe(400);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenDirector()}`)
      .send({
        nombre: 'Juan',
        correo: 'juan@sepyc.gob.mx',
        contra: 'contrasena123',
        idRol:  UUID_ROL_ADMIN,
      });

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/usuarios/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);
    mockPrisma.usuario.update.mockResolvedValue({ ...usuarioBase, nombre: 'Nuevo Nombre' } as any);

    const res = await request(app)
      .put('/api/usuarios/uuid-usuario')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nuevo Nombre');
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/usuarios/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/usuarios/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(usuarioBase as any);
    mockPrisma.usuario.update.mockResolvedValue({ ...usuarioBase, activo: false } as any);

    const res = await request(app)
      .delete('/api/usuarios/uuid-usuario')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si no existe', async () => {
    mockPrisma.usuario.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/usuarios/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});