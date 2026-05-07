import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { mockPrisma } from '../mocks/prisma.mock';
import { mockReset } from 'vitest-mock-extended';
import jwt from 'jsonwebtoken';

const tokenAdmin = () => jwt.sign(
  { id: 'uuid-admin', rol: 'admin' },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

const tokenDirector = () => jwt.sign(
  { id: 'uuid-director', rol: 'director', idEsc: 'uuid-escuela' },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

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
  directores:   [],
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe('GET /api/supervisor/escuelas', () => {

  it('debe retornar 200 con lista de escuelas', async () => {
    mockPrisma.escuela.findMany.mockResolvedValue([escuelaBase]);

    const res = await request(app)
      .get('/api/supervisor/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/supervisor/escuelas');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 con token de director', async () => {
    const res = await request(app)
      .get('/api/supervisor/escuelas')
      .set('Authorization', `Bearer ${tokenDirector()}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/supervisor/escuelas/:id', () => {

  it('debe retornar 200 con la escuela encontrada', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase as any);

    const res = await request(app)
      .get('/api/supervisor/escuelas/uuid-escuela')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(200);
    expect(res.body.clave).toBe('SIN0001');
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/supervisor/escuelas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/supervisor/escuelas', () => {

  it('debe retornar 201 al crear escuela correctamente', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);
    mockPrisma.usuarioDirector.findFirst.mockResolvedValue(null);
    mockPrisma.escuela.create.mockResolvedValue(escuelaBase);

    const res = await request(app)
      .post('/api/supervisor/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre:      'Secundaria Lazaro Cardenas',
        clave:       'SIN0001',
        zonaEscolar: 'Z001',
        nivel:       'Secundaria',
        director: {
          nombre: 'Juan Perez',
          correo: 'director@escuela.mx',
          contra: 'director123',
        },
      });

    expect(res.status).toBe(201);
  });

  it('debe retornar 409 si la clave ya existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase);

    const res = await request(app)
      .post('/api/supervisor/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({
        nombre:      'Otra Escuela',
        clave:       'SIN0001',
        zonaEscolar: 'Z001',
        nivel:       'Secundaria',
        director: {
          nombre: 'Director',
          correo: 'director2@escuela.mx',
          contra: 'director123',
        },
      });

    expect(res.status).toBe(409);
  });

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/supervisor/escuelas')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Sin clave ni director' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/supervisor/escuelas/:id', () => {

  it('debe retornar 200 al actualizar correctamente', async () => {
    mockPrisma.escuela.findFirst
      .mockResolvedValueOnce(escuelaBase as any)
      .mockResolvedValueOnce(null);
    mockPrisma.escuela.update.mockResolvedValue({
      ...escuelaBase, nombre: 'Nuevo Nombre',
    });

    const res = await request(app)
      .put('/api/supervisor/escuelas/uuid-escuela')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nuevo Nombre');
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/supervisor/escuelas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/supervisor/escuelas/:id', () => {

  it('debe retornar 204 al eliminar correctamente', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(escuelaBase as any);
    mockPrisma.escuela.update.mockResolvedValue({ ...escuelaBase, activo: false });

    const res = await request(app)
      .delete('/api/supervisor/escuelas/uuid-escuela')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(204);
  });

  it('debe retornar 404 si la escuela no existe', async () => {
    mockPrisma.escuela.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/supervisor/escuelas/uuid-inexistente')
      .set('Authorization', `Bearer ${tokenAdmin()}`);

    expect(res.status).toBe(404);
  });
});