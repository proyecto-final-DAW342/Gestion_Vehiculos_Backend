export const verifyConductorBody = (body) => {
  if (!body.dni) throw { code: 400, customMessage: "Missing data: dni" };
  if (!body.nombre) throw { code: 400, customMessage: "Missing data: nombre" };
  if (!body.apellidos)
    throw { code: 400, customMessage: "Missing data: apellidos" };
  if (!body.telefono)
    throw { code: 400, customMessage: "Missing data: telefono" };
  if (!body.direccion)
    throw { code: 400, customMessage: "Missing data: direccion" };
  if (!body.fechaNacimiento)
    throw { code: 400, customMessage: "Missing data: fecha de nacimiento" };
};

export const verifyTrayectoBody = (body) => {
  if (body.id === undefined)
    throw { code: 400, customMessage: "Missing data: id" };
  if (!body.horaSalida)
    throw { code: 400, customMessage: "Missing data: hora de salida" };
  if (!body.horaLlegada)
    throw { code: 400, customMessage: "Missing data: hora de llegada" };
  if (!body.origen) throw { code: 400, customMessage: "Missing data: origen" };
  if (!body.destino)
    throw { code: 400, customMessage: "Missing data: destino" };
  if (body.distanciaEnKm === undefined)
    throw { code: 400, customMessage: "Missing data: Distaancia (Km)" };
};

export const verifyVehiculoBody = () => {};

export const verifyRevisionBody = () => {};
