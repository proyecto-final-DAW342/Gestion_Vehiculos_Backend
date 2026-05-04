import cloudinary from "./lib/cloudinary";
import prisma from "./lib/prisma";

export const createUserData = (body) => {
  const data = {};

  const { email, password, fullName, telefono, isActive, roles } = body;

  if (email) data.email = email;
  if (password) data.password = password;
  if (fullName) data.fullName = fullName;
  if (telefono) data.telefono = telefono;
  if (isActive) data.isActive = isActive;
  if (roles) data.roles = roles;

  return data;
};

export const createTrayectoData = (body, method) => {
  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  const data = {};

  const { horaSalida, horaLlegada, origen, destino, distanciaEnKm, viajeId } =
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
    data.horaSalida = new Date(horaSalida);
    data.horaLlegada = new Date(horaLlegada);
    data.origen = origen;
    data.destino = destino;
    data.distanciaEnKm = distanciaEnKm;
    data.viajeId = viajeId;
  }

  return data;
};

export const createConductorData = async (body, method, existing = null) => {
  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  const data = {};

  const {
    dni,
    nombre,
    apellidos,
    telefono,
    direccion,
    fechaNacimiento,
    vehiculo,
    image,
  } = body;

  if (method === "patch") {
    if (nombre !== undefined) data.nombre = nombre;
    if (apellidos !== undefined) data.apellidos = apellidos;
    if (telefono !== undefined) data.telefono = telefono;
    if (direccion !== undefined) data.direccion = direccion;
    if (fechaNacimiento !== undefined)
      data.fechaNacimiento = new Date(fechaNacimiento);
    if (image !== undefined) {
      if (existing.image) {
        if (existing.image.fromCloudinary)
          await cloudinary.uploader.destroy(existing.image.nombre);
        const id = existing.image.id;
        await prisma.images.delete({ where: { id } });
      }

      if (image.url !== null) {
        data.image = {
          create: {
            url: image.url,
            nombre: image.name,
            fromCloudinary: image.fromCloudinary,
          },
        };
      }
    }

    if (vehiculo !== undefined) {
      data.vehiculo = {
        connect: vehiculo.map((matricula) => ({ matricula })),
      };
    }
  }

  if (method === "post") {
    data.dni = dni;
    data.nombre = nombre;
    data.apellidos = apellidos;
    data.telefono = telefono;
    data.direccion = direccion;
    data.fechaNacimiento = new Date(fechaNacimiento);
    if (image) {
      data.image = {
        create: {
          url: image.url,
          nombre: image.name,
          fromCloudinary: image.fromCloudinary,
        },
      };
    }
    if (vehiculo && vehiculo.length) {
      data.vehiculo = {
        connect: vehiculo.map((matricula) => ({ matricula })),
      };
    }
  }

  return data;
};

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
