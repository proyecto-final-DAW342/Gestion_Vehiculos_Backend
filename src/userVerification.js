import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const PROTECCION_DEFAULT = 1;

const proteccionPorMetodo = {
  PATCH: 1,
  POST: 1,
  DELETE: 1,
  GET: 0,
};

const proteccionPorRuta = {
  DEFAULT: 1,
  "/api/files": 3,
  "/api/files/upload": 3,
  "/api/auth/check-status": 1,
  "/api/auth/register": 3,
  "/api/users": 3,
};

const nivelProteccion = [
  null, // 0
  verifyUserLogged, // 1
  verifyUserAdminOrSameDni, // 2
  verifyUserAdmin, // ...
];

export async function verifyUser(request, params = {}) {
  try {
    const authHeader = request.headers.get("Authorization");

    let ruta = request.url;

    try {
      // Intentamos parsear la URL para quedarnos con el pathname (sin query ni host)
      ruta = new URL(request.url).pathname;
    } catch (e) {
      // Ignorar si no es una URL absoluta válida
    }

    if (Object.keys(params).length > 0) {
      // Quito la última parte de la ruta asumiendo que es un parámetro de ruta
      const parts = ruta.split("/");
      parts.pop();
      ruta = parts.join("/");
    }

    const nivel =
      proteccionPorRuta[ruta] ??
      proteccionPorMetodo[request.method] ??
      PROTECCION_DEFAULT;

    if (!nivel || nivel === 0) return null;

    let user;

    if (nivel === 2) {
      // El DNI viene en params
      const dni = params.dni;
      if (!dni)
        throw {
          code: 401,
          customMessage: "Se requiere DNI para esta validación",
        };

      user = await nivelProteccion[nivel](authHeader, dni);
      return user;
    }

    if (nivel === 3) {
      user = await nivelProteccion[nivel](authHeader);
      return user;
    }

    user = await nivelProteccion[nivel](authHeader);
    return user;
  } catch (error) {
    throw error;
  }
}

async function verifyUserLogged(authHeader) {
  try {
    if (!authHeader) {
      throw { code: 401, customMessage: "Error: no has enviado token" };
    }

    const token = authHeader.split(" ")[1] || authHeader;

    const { dni } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { dni } });

    if (!user) {
      throw { code: 401, customMessage: "Error: el usuario no existe" };
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function verifyUserAdmin(authHeader) {
  try {
    const user = await verifyUserLogged(authHeader);

    if (!user.roles.includes("admin")) {
      throw {
        code: 403,
        customMessage: "No autorizado. No tienes permisos suficientes.",
      };
    }

    return user;
  } catch (error) {
    throw error;
  }
}

export async function verifyUserAdminOrSameDni(authHeader, dni) {
  try {
    let user = await verifyUserLogged(authHeader);
    if (user.dni !== dni && !user.roles.includes("admin")) {
      throw {
        code: 403,
        customMessage: "No tienes permisos para acceder a este recurso",
      };
    }

    return user;
  } catch (error) {
    throw error;
  }
}
