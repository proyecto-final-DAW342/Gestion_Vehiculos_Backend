export const createRevisionData = (body, method) => {
  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  const data = {};

  const { fecha, lugar, aprobada, costo, visible, vehiculoMatricula, viajeId } =
    body;

  if (method === "patch") {
    if (lugar !== undefined) data.lugar = lugar;
    if (aprobada !== undefined) data.aprobada = aprobada;
    if (fecha !== undefined) data.fecha = new Date(fecha);
    if (costo !== undefined) data.costo = costo;
    if (visible !== undefined) data.visible = visible;
    if (vehiculoMatricula !== undefined)
      data.vehiculoMatricula = vehiculoMatricula;
    if (viajeId !== undefined) data.viajeId = viajeId;
  }

  if (method === "post") {
    data.fecha = new Date(fecha);
    data.lugar = lugar;
    data.aprobada = aprobada;
    data.costo = costo;
    data.visible = visible;
    data.vehiculoMatricula = vehiculoMatricula;
    data.viajeId = viajeId;
  }

  return data;
};

export const createVehiculoData = (body, method) => {
  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  const data = {};

  if (method === "patch") {
    if (body.marca !== undefined) data.marca = body.marca;
    if (body.modelo !== undefined) data.modelo = body.modelo;
    if (body.fechaCompra !== undefined)
      data.fechaCompra = new Date(body.fechaCompra);
    if (body.anyosAntiguedad !== undefined)
      data.anyosAntiguedad = body.anyosAntiguedad;
    if (body.tipo !== undefined) data.tipo = body.tipo;
    if (body.kilometrosTotales !== undefined)
      data.kilometrosTotales = body.kilometrosTotales;
    if (body.alimentacion !== undefined) data.alimentacion = body.alimentacion;
    if (body.precio !== undefined) data.precio = body.precio;
    if (body.gastoPorKm !== undefined) data.gastoPorKm = body.gastoPorKm;
    if (body.conductorDni !== undefined) data.conductorDni = body.conductorDni;
    //Faltan las revisiones y las averías
    if (body.imagenes !== undefined) {
      data.imagenes = {
        connectOrCreate: body.imagenes.map(({ id, url, nombre }) => ({
          where: { id },
          create: { id, url, nombre },
        })),
      };
    }
  }

  if (method === "post") {
    data.matricula = body.matricula;
    data.marca = body.marca;
    data.modelo = body.modelo;
    data.fechaCompra = new Date(body.fechaCompra);
    data.anyosAntiguedad = body.anyosAntiguedad;
    data.tipo = body.tipo;
    data.kilometrosTotales = body.kilometrosTotales;
    data.alimentacion = body.alimentacion;
    data.precio = body.precio || 0;
    data.gastoPorKm = body.gastoPorKm;

    if (body.conductorDni) data.conductorDni = bodyconductorDni;
    if (body.imagenes && body.imagenes.length) {
      data.imagenes = {
        connect: body.imagenes.map(({ id }) => ({ id })),
      };
    }
  }

  return data;
};
