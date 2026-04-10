import { NextResponse } from "next/server";
//https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes
//https://www.prisma.io/docs/orm/reference/error-reference#error-codes
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

export async function errorHandling(error, customMessage = null) {
  const message =
    customMessage ||
    GENERAL_ERROR_MESSAGES[error] ||
    PRISMA_ERROR_MESSAGES[error?.code] ||
    "Error desconocido";

  if (typeof error === "number")
    return NextResponse.json({ error: message }, { status: error });

  if (error?.code && PRISMA_ERROR_MESSAGES[error.code])
    return NextResponse.json({ error: message }, { status: 400 });

  console.error(error);
  return NextResponse.json(
    { error: GENERAL_ERROR_MESSAGES[500] },
    { status: 500 },
  );
}
