import cloudinary from "./lib/cloudinary";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const createUserData = async (body, method) => {
  let plantilla;
  const plantillaBase = {
    dni: z.string(),
    email: z.email(),
    password: z.string(),
    fullName: z.string(),
    telefono: z.int().optional(),
    isActive: z.boolean(),
    roles: z.array(z.string()),
  };
  let data = {};

  const { dni } = body;

  if (method === "post") plantilla = z.object(plantillaBase);
  if (method === "patch") plantilla = z.object(plantillaBase).partial();

  data = plantilla.parse(body);

  if (data.password) data.password = bcrypt.hashSync(data.password);

  if (await prisma.conductor.findUnique({ where: { dni: body.dni } })) {
    data.conductor = {
      connect: { dni },
    };
  }

  return data;
};

export const createTrayectoData = (body, method) => {
  let plantilla;
  const plantillaBase = {
    horaSalida: z.string(),
    horaLlegada: z.string(),
    origen: z.string(),
    destino: z.string(),
    distanciaEnKm: z.int(),
    viajeId: z.int(),
  };

  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  if (method === "post") plantilla = z.object(plantillaBase);
  if (method === "patch") plantilla = z.object(plantillaBase).partial();

  let data = plantilla.parse(body);

  data.horaSalida = new Date(data.horaSalida);
  data.horaLlegada = new Date(data.horaLlegada);

  return data;
};

export const createConductorData = async (body, method, existing = null) => {
  let plantilla;
  const plantillaBase = {
    dni: z.string(),
    nombre: z.string(),
    apellidos: z.string(),
    telefono: z.string(),
    direccion: z.string(),
    fechaNacimiento: z.string(),
    vehiculo: z.array(z.string()).optional(),
    image: z
      .object({
        nombre: z.string(),
        url: z.string(),
        fromCloudinary: z.boolean(),
      })
      .nullable()
      .optional(),
  };
  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  if (method === "post") plantilla = z.object(plantillaBase);
  if (method === "patch") plantilla = z.object(plantillaBase).partial();

  let data = plantilla.parse(body);

  if (data.fechaNacimiento)
    data.fechaNacimiento = new Date(data.fechaNacimiento);

  if (data.image) {
    if (existing && existing.image) {
      if (existing.image.fromCloudinary)
        await cloudinary.uploader.destroy(existing.image.nombre);
      const id = existing.image.id;
      await prisma.images.delete({ where: { id } });
    }

    if (data.image.url !== null) {
      data.image = {
        create: {
          url: data.image.url,
          nombre: data.image.nombre,
          fromCloudinary: data.image.fromCloudinary,
        },
      };
    }
  }

  if (data.vehiculo && data.vehiculo.length) {
    data.vehiculo = {
      connect: data.vehiculo.map((matricula) => ({ matricula })),
    };
  }

  if (await prisma.user.findUnique({ where: { dni: data.dni } })) {
    data.userDni = data.dni;
  }

  return data;
};

export const createRevisionData = (body, method) => {
  let plantilla;
  let planatillaBase = {};
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
