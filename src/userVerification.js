import jwt from "jsonwebtoken";

const proteccion = {
  DEFAULT: 1,
  "/api/auth/register": 0,
  "/api/users": 1,
};

const nivelProteccion = [
  null,
  verifyUserLogged,
  verifyUserAdminOrSameDni,
  verifyUserAdmin,
];

/*export async function verifyUser(request, dni = null) {
  try {
    nivel = proteccion[request.url] || proteccion["DEFAULT"]
    if (!nivel) return
    if (nivel === 2) {
        if (!dni) throw {code: 401}

        nivelProteccion[nivel](request.headers.get("Authorization"), dni)
        return user;
    }
    
    nivelProteccion[nivel](request.headers.get("Authorization"))
    return user;
  } catch (error) {
    throw error;
  }
}*/

export async function verifyUser(authHeader) {
  try {
    if (!authHeader) {
      throw { code: 401 };
    }

    const token = authHeader.split(" ")[1] || authHeader;

    const { dni } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { dni } });

    if (!user) {
      throw { code: 401 };
    }

    return user;
  } catch (error) {
    throw error;
  }
}

export async function verifyUserLogged(authHeader) {
  try {
    if (!authHeader) {
      throw { code: 401 };
    }

    const token = authHeader.split(" ")[1] || authHeader;

    const { dni } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { dni } });

    if (!user) {
      throw { code: 401 };
    }

    return user;
  } catch (error) {
    throw error;
  }
}

export async function verifyUserAdmin(authHeader) {
  try {
    const user = await verifyUser(authHeader);

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
    let user = await verifyUser(authHeader);
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
