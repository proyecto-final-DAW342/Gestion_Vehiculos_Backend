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

export const verifyVehiculoBody = () => {};

export const verifyRevisionBody = () => {};
