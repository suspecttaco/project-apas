import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { mockPrisma } from "../mocks/prisma.mock";
import { mockReset } from "vitest-mock-extended";
import bcrypt from "bcrypt";

beforeEach(() => {
  mockReset(mockPrisma);
});

describe("POST /api/auth/supervisor/login", () => {
  it("debe retornar 200 y token con credenciales correctas", async () => {
    const hash = await bcrypt.hash("admin123", 12);
    mockPrisma.usuarioSupervisor.findFirst.mockResolvedValue({
      id: "uuid-admin",
      nombre: "Administrador",
      correo: "admin@sepyc.gob.mx",
      contra: hash,
      rol: "admin",
      activo: true,
      fCre: new Date(),
      fMod: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/supervisor/login")
      .send({ correo: "admin@sepyc.gob.mx", contra: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token.split(".")).toHaveLength(3);
  });

  it("debe retornar 401 con credenciales incorrectas", async () => {
    mockPrisma.usuarioSupervisor.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/supervisor/login")
      .send({ correo: "noexiste@test.com", contra: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("debe retornar 400 si el body es invalido", async () => {
    const res = await request(app)
      .post("/api/auth/supervisor/login")
      .send({ correo: "no-es-email", contra: "123" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("POST /api/auth/director/login", () => {
  it("debe retornar 200 y token con idEsc en el payload", async () => {
    const hash = await bcrypt.hash("director123", 12);

    mockPrisma.usuarioDirector.findFirst.mockResolvedValue({
      id: "uuid-director",
      idEsc: "uuid-escuela",
      nombre: "Director",
      correo: "director@escuela.mx",
      contra: hash,
      activo: true,
      fCre: new Date(),
      fMod: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/director/login")
      .send({ correo: "director@escuela.mx", contra: "director123" });

    expect(res.status).toBe(200);
  });

  it("debe retornar 401 con credenciales incorrectas", async () => {
    mockPrisma.usuarioDirector.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/director/login")
      .send({ correo: "noexiste@test.com", contra: "123456" });

    expect(res.status).toBe(401);
  });

  it("debe retornar 400 si faltan campos requeridos", async () => {
    const res = await request(app)
      .post("/api/auth/director/login")
      .send({ correo: "director@escuela.mx" });

    expect(res.status).toBe(400);
  });
});
