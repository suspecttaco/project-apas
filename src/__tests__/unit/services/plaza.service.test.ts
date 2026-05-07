import { describe, it, expect, beforeEach } from "vitest";
import { mockPrisma } from "../../mocks/prisma.mock";
import { PlazaService } from "../../../modules/plaza/plaza.service";
import { NotFoundError, ConflictError } from "../../../lib/errors";
import { mockReset } from "vitest-mock-extended";

const idEsc = "uuid-escuela";

const plazaBase = {
  id: "uuid-plaza",
  idEmpleado: "uuid-empleado",
  idNombramiento: "uuid-nombramiento",
  idMateria: "uuid-materia",
  idEsc,
  codigoPlaza: "10EES0001P1A001",
  horasClase: 20,
  horasDescarga: null,
  horasFortalec: null,
  funcDescarga: null,
  evaluado: null,
  observaciones: null,
  activo: true,
  fCre: new Date(),
  fMod: new Date(),
  nombramiento: { id: "uuid-nombramiento", nombre: "Profesor" },
  materia: { id: "uuid-materia", nombre: "Matematicas" },
  grupos: [],
};

const empleadoBase = {
  id: "uuid-empleado",
  idEsc,
  activo: true,
  numControl: "2",
};

beforeEach(() => {
  mockReset(mockPrisma);
});

describe("PlazaService", () => {
  describe("getAll", () => {
    it("debe retornar lista de plazas de la escuela", async () => {
      mockPrisma.plaza.findMany.mockResolvedValue([plazaBase] as any);

      const result = await PlazaService.getAll(idEsc);

      expect(result).toHaveLength(1);
      expect(mockPrisma.plaza.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ idEsc }) }),
      );
    });
  });

  describe("getById", () => {
    it("debe retornar la plaza si existe", async () => {
      mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);

      const result = await PlazaService.getById("uuid-plaza", idEsc);

      expect(result!.id).toBe("uuid-plaza");
    });

    it("debe lanzar NotFoundError si no existe", async () => {
      mockPrisma.plaza.findFirst.mockResolvedValue(null);

      await expect(
        PlazaService.getById("uuid-inexistente", idEsc),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("create", () => {
    it("debe crear la plaza y asignar grupos correctamente", async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.plaza.findFirst
        .mockResolvedValueOnce(null) // verificar codigo duplicado
        .mockResolvedValueOnce(plazaBase as any); // resultado final dentro de transaction

      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn(mockPrisma),
      );
      mockPrisma.plaza.create.mockResolvedValue(plazaBase as any);
      mockPrisma.plazaGrupo.createMany.mockResolvedValue({ count: 2 });

      await PlazaService.create(
        {
          idEmpleado: "uuid-empleado",
          idNombramiento: "uuid-nombramiento",
          idMateria: "uuid-materia",
          codigoPlaza: "10EES0001P1A001",
          horasClase: 20,
          idGrupos: ["uuid-grupo-1", "uuid-grupo-2"],
        },
        idEsc,
      );

      expect(mockPrisma.plaza.create).toHaveBeenCalledOnce();
      expect(mockPrisma.plazaGrupo.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ idGrupo: "uuid-grupo-1" }),
            expect.objectContaining({ idGrupo: "uuid-grupo-2" }),
          ]),
        }),
      );
    });

    it("debe crear la plaza sin grupos si no se proporcionan", async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.plaza.findFirst
        .mockResolvedValueOnce(null) // verificar codigo duplicado
        .mockResolvedValueOnce(plazaBase as any); // resultado final dentro de transaction

      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn(mockPrisma),
      );
      mockPrisma.plaza.create.mockResolvedValue(plazaBase as any);

      await PlazaService.create(
        {
          idEmpleado: "uuid-empleado",
          idNombramiento: "uuid-nombramiento",
          codigoPlaza: "10EES0001P1A001",
        },
        idEsc,
      );

      expect(mockPrisma.plazaGrupo.createMany).not.toHaveBeenCalled();
    });
    
    it("debe lanzar NotFoundError si el empleado no existe", async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(null);

      await expect(
        PlazaService.create(
          {
            idEmpleado: "uuid-inexistente",
            idNombramiento: "uuid-nombramiento",
            codigoPlaza: "10EES0001P1A001",
          },
          idEsc,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("debe lanzar ConflictError si el codigo de plaza ya existe", async () => {
      mockPrisma.empleado.findFirst.mockResolvedValue(empleadoBase as any);
      mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);

      await expect(
        PlazaService.create(
          {
            idEmpleado: "uuid-empleado",
            idNombramiento: "uuid-nombramiento",
            codigoPlaza: "10EES0001P1A001",
          },
          idEsc,
        ),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("update", () => {
    it("debe reemplazar grupos al actualizar con nuevos idGrupos", async () => {
      mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);

      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn(mockPrisma),
      );

      mockPrisma.plazaGrupo.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.plazaGrupo.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.plaza.update.mockResolvedValue(plazaBase as any);

      await PlazaService.update(
        "uuid-plaza",
        { idGrupos: ["uuid-grupo-nuevo"] },
        idEsc,
      );

      expect(mockPrisma.plazaGrupo.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { idPlaza: "uuid-plaza" } }),
      );
      expect(mockPrisma.plazaGrupo.createMany).toHaveBeenCalledOnce();
    });

    it("debe no tocar grupos si idGrupos no se proporciona en el update", async () => {
      mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);

      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn(mockPrisma),
      );

      mockPrisma.plaza.update.mockResolvedValue(plazaBase as any);

      await PlazaService.update("uuid-plaza", { horasClase: 25 }, idEsc);

      expect(mockPrisma.plazaGrupo.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe("softDelete", () => {
    it("debe hacer soft delete correctamente", async () => {
      mockPrisma.plaza.findFirst.mockResolvedValue(plazaBase as any);
      mockPrisma.plaza.update.mockResolvedValue({
        ...plazaBase,
        activo: false,
      } as any);

      await PlazaService.softDelete("uuid-plaza", idEsc);

      expect(mockPrisma.plaza.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { activo: false } }),
      );
    });

    it("debe lanzar NotFoundError si la plaza no existe", async () => {
      mockPrisma.plaza.findFirst.mockResolvedValue(null);

      await expect(
        PlazaService.softDelete("uuid-inexistente", idEsc),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
