import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import { tokenAdmin, tokenSupervisor, tokenDirector } from './setup';

const escuelaBase = {
  id:           'uuid-escuela',
  nombre:       'Secundaria Lazaro Cardenas',
  clave:        'SIN0001',
  zonaEscolar:  'Z001',
  nivel:        'Secundaria',
  numTel:       null,
  correo:       null,
  domicilio:    null,
  localidad:    null,
  municipio:    null,
  estado:       null,
  codigoPostal: null,
  activo:       true,
  fCre:         new Date(),
  fMod:         new Date(),
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/escuelas', () => {

  it('debe retornar 200 con lista de escuelas para admin', async () => {
    mockPrisma.escuela.findMany.mockResolvedValue([escuelaBase]);

    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 200 con lista de escuelas para supervisor', async () => {
    mockPrisma.escuela.findMany.mockResolvedValue([escuelaBase]);

    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', `Bearer ${tokenSupervisor()}`);

    expect(res.status).toBe(200);
  });

  it('debe retornar 403 para director', async () => {
    const res = await request(app)
      .get('/api/escuelas')
      .set('Authorization', `Bearer ${tokenDirector()}`);

    expect(res.status).toBe(403);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/escuelas');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/escuelas/:id', () => {

  it('debe retornar 200 con la escuela encontrada', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue({ ...escuelaBase, usuarios: [] } as any);

    const res = await request(app)
      .get('/api/escuelas/uuid-escuela')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.clave).toBe('SIN0001');
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/escuelas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/escuelas', () => {

  it('debe retornar 201 al crear escuela correctamente', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.escuela.create.mockResolvedValue(escuelaBase);

    const res = await request(app)
      .post('/api/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre:      'Secundaria Lazaro Cardenas',
        clave:       'SIN0001',
        zonaEscolar: 'Z001',
        nivel:       'Secundaria',
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si la clave ya existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase);

    const res = await request(app)
      .post('/api/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre:      'Otra Escuela',
        clave:       'SIN0001',
        zonaEscolar: 'Z001',
        nivel:       'Secundaria',
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Sin clave' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/escuelas/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.escuela.findFirst
      .mockResolvedValueOnce({ ...escuelaBase, usuarios: [] } as any)
      .mockResolvedValueOnce(null);
    mockPrisma.escuela.update.mockResolvedValue({ ...escuelaBase, nombre: 'Nuevo Nombre' });

    const res = await request(app)
      .put('/api/escuelas/uuid-escuela')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nuevo Nombre');
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/escuelas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/escuelas/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue({ ...escuelaBase, usuarios: [] } as any);
    mockPrisma.escuela.update.mockResolvedValue({ ...escuelaBase, activo: false });

    const res = await request(app)
      .delete('/api/escuelas/uuid-escuela')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/escuelas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});