import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
//https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes
//https://www.prisma.io/docs/orm/reference/error-reference#error-codes
const AUTH_ERRORS = {
  TokenExpiredError: { code: 401, message: "Sesión expirada" },
  JsonWebTokenError: { code: 401, message: "Sesión expirada" },
};

const GENERAL_ERROR_MESSAGES = {
  400: "Bad request. Revisa los datos enviados.",
  401: "Unauthorized. Token expirado o inválido.",
  403: "Forbidden. No puedes acceder a este recurso",
  404: "Not found. El objeto no existe.",
  405: "Method not allowed. No puedes usar ese método",
  409: "Conflict. El objeto ya existe.",
  422: "Unprocessable Entity. Error de validación semántica.",
  500: "Internal server error",
};

const PRISMA_ERROR_MESSAGES = {
  P2002:
    "P2002: El objeto con esa clave primaria ya existe en la base de datos",
  P2021: "P2021: Se están llamando tablas que no existen",
  P2025:
    "P2025: La operación falló porque el objeto está asociado a otro que no fue encontrado. Comprueba la clave foránea",
};

export async function errorHandling(err, customMessage = null) {
  AUTH_ERRORS[err?.name] && (err = AUTH_ERRORS[err?.name]);

  const message =
    customMessage ||
    err?.customMessage ||
    GENERAL_ERROR_MESSAGES[err?.code] ||
    PRISMA_ERROR_MESSAGES[err?.code] ||
    "Error desconocido";

  if (typeof err?.code === "number") {
    console.error(err.message || err.code);
    return NextResponse.json({ error: message }, { status: err.code });
  }

  if (err?.code && PRISMA_ERROR_MESSAGES[err?.code]) {
    console.error(err.message || err.code);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    console.log(err);
    return NextResponse.json(
      { error: "Revisa los datos enviados." },
      { status: 400 },
    );
  }

  if (err instanceof ZodError) {
    const e = JSON.parse(err.message)[0];

    return NextResponse.json(
      {
        error: `ERROR: Hay campos inválidos en la petición -> ${e.path}: ${e.message}`,
      },
      { status: 400 },
    );
  }

  console.error(err);
  return NextResponse.json(
    { error: GENERAL_ERROR_MESSAGES[500] },
    { status: 500 },
  );
}
