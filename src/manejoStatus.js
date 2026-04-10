import { NextResponse } from "next/server";
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
  409: "Conflict. El objeto ya existe.",
  422: "Unprocessable Entity. Error de validación semántica.",
  500: "Internal server error",
};

const PRISMA_ERROR_MESSAGES = {
  P2002:
    "P2002: El objeto con esa clave primaria ya existe en la base de datos",
};

export async function errorHandling(err, customMessage = null) {
  AUTH_ERRORS[err?.name] && (err = AUTH_ERRORS[err?.name]);

  const message =
    customMessage ||
    err?.message ||
    GENERAL_ERROR_MESSAGES[err?.code] ||
    PRISMA_ERROR_MESSAGES[err?.code] ||
    "Error desconocido";

  if (typeof err?.code === "number") {
    console.error(err.message || err.code);
    return NextResponse.json({ error: message }, { status: err.code });
  }

  if (err?.code && PRISMA_ERROR_MESSAGES[err?.code])
    return NextResponse.json({ error: message }, { status: 400 });

  console.error(err);
  return NextResponse.json(
    { error: GENERAL_ERROR_MESSAGES[500] },
    { status: 500 },
  );
}
