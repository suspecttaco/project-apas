import { db } from "./db";

// Carga al arrancar el servidor y se reincia al actualizar roles o permisos
// Cache: idRol -> conjunto de nombres de permisos
const cache = new Map<string, Set<string>>();

// Carga o recarga todos los roles y sus permisos desde BD
export async function cargarPermisos(): Promise<void> {
    const roles = await db.rolUsuario.findMany({
        where: { activo: true },
        include: {
            permisos: {
                include: { permiso: true },
            },
        },
    });

    cache.clear();

    for (const rol of roles) {
        const nombresPermisos = new Set(
            rol.permisos.map(rp => rp.permiso.nombre)
        );
        cache.set(rol.id, nombresPermisos);
    }
}

// Verifica si un rol tiene un permiso especifico
export function tienePermiso(idRol: string, permiso: string): boolean {
  return cache.get(idRol)?.has(permiso) ?? false;
}