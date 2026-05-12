import { PLANTILLA_FRECUENCIA, PLANTILLA_TRIGGER } from "@prisma/client";
import cloudinary from "./lib/cloudinary";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const plantillaBase = {
  PLANTILLA_USUARIO: {
    dni: z.string().nullable(),
    email: z.email().nullable(),
    password: z.string().nullable(),
    fullName: z.string().nullable(),
    telefono: z.string().nullable(),
    isActive: z.boolean().optional().nullable(),
    roles: z.array(z.string()).optional(),
  },

  PLANTILLA_TRAYECTO: {
    horaSalida: z.string(),
    horaLlegada: z.string(),
    origen: z.string(),
    destino: z.string(),
    distanciaEnKm: z.int(),
    viajeId: z.string().optional(),
  },

  PLANTILLA_CONDUCTOR: {
    dni: z.string().nullable(),
    nombre: z.string().nullable(),
    apellidos: z.string().nullable(),
    telefono: z.string().nullable(),
    direccion: z.string().nullable(),
    fechaNacimiento: z.string().nullable(),
    vehiculo: z.array(z.string()).nullable().optional(),
    image: z
      .object({
        nombre: z.string().nullable(),
        url: z.string().nullable(),
        fromCloudinary: z.boolean().nullable(),
      })
      .nullable()
      .optional(),
  },

  PLANTILLA_REVISION: {
    descripcion: z.string().nullable(),
    lugar: z.string().nullable(),
    aprobada: z.boolean().nullable(),
    fecha: z.string().nullable(),
    costo: z.float32().nullable(),
    visible: z.boolean().nullable(),
    vehiculoMatricula: z.string().nullable().optional(),
    viajeId: z.string().nullable().optional(),
    plantillaId: z.string().nullable().optional(),
    kilometrosActuales: z.int().nullable().optional(),
  },

  PLANTILLA_VEHICULO: {
    matricula: z.string().nullable(),
    marca: z.string().nullable(),
    modelo: z.string().nullable(),
    fechaCompra: z.string().nullable(),
    fechaMatriculacion: z.string().nullable(),
    tipo: z.string().nullable(),
    kilometrosTotales: z.float64().nullable(),
    alimentacion: z.string().nullable(),
    precio: z.float64().nullable(),
    gastoCombustiblePorKiloetro: z.float64().nullable(),
    capacidadTanqueCombustible: z.float64().nullable(),
    conductorDni: z.string().nullable().optional(),
    plantillaId: z.string().nullable().optional(),
    imagenes: z.array(z.string()).nullable().optional(),
    revisiones: z.array(z.string()).nullable().optional(),
    averias: z.array(z.string()).nullable().optional(),
    viajes: z.array(z.string()).nullable().optional(),
  },

  PLANTILLA_VIAJE: {
    descripcion: z.string().nullable(),
    kmSalida: z.float64().nullable().optional(),
    kmLlegada: z.float64().nullable().optional(),
    origen: z.string().nullable(),
    destino: z.string().nullable(),
    porcentajeCombustibleInicio: z.float64().nullable().optional(),
    porcentajeCombustibleFinal: z.float64().nullable().optional(),
    litrosCombustibleInicio: z.float64().nullable().optional(),
    litrosCombustibleFinal: z.float64().nullable().optional(),
    visible: z.boolean().nullable(),
    vehiculoMatricula: z.string().nullable().optional(),
    conductorDni: z.string().nullable().optional(),
    revisionId: z.string().nullable().optional(),
    trayectos: z
      .array(
        z.object({
          horaSalida: z.string(),
          horaLlegada: z.string(),
          origen: z.string(),
          destino: z.string(),
          distanciaEnKm: z.int(),
        }),
      )
      .nullable()
      .optional(),
  },

  PLANTILLA_AVERIA: {
    descripcion: z.string().nullable(),
    fechaAveria: z.string().nullable(),
    fechaComienzoReparacion: z.string().nullable().optional(),
    fechaFinReparacion: z.string().nullable().optional(),
    lugarReparacion: z.string().nullable().optional(),
    costeReparacion: z.float64().nullable().optional(),
    resuelta: z.boolean().nullable().optional(),
    vehiculoMatricula: z.string().nullable(),
    userDni: z.string().nullable(),
  },

  PLANTILLA_PLANTILLA_REVISION: {
    nombre: z.string().nullable(),
    esItv: z.boolean().nullable().optional(),
    rangos: z
      .array(
        z.object({
          desdeAnyo: z.int().nullable().optional(),
          desdeKilometro: z.int().nullable().optional(),
          frecuenciaMeses: z.int().nullable().optional(),
          frecuenciaKilometros: z.int().nullable().optional(),
        }),
      )
      .nullable(),
    vehiculos: z.array(z.string()),
    revisiones: z.array(z.string()).nullable().optional(),
    trigger: z.enum(PLANTILLA_TRIGGER),
    frecuencia: z.enum(PLANTILLA_FRECUENCIA),
    margenDias: z.int().nullable().optional(),
  },

  PLANTILLA_RANGO: {
    desdeAnyo: z.int().nullable().optional(),
    desdeKilometro: z.int().nullable().optional(),
    frecuenciaMeses: z.int().nullable().optional(),
    frecuenciaKilometros: z.int().nullable().optional(),
    plantillaId: z.string().nullable().optional(),
  },
};

const createDataFromPlantilla = (tipo, body, method) => {
  method = method.toLowerCase();
  if (method != "post" && method != "patch") throw { code: 405 };

  const plantilla =
    method === "post"
      ? z.object(plantillaBase[tipo])
      : z.object(plantillaBase[tipo]).partial();

  return plantilla.parse(body);
};

export const createUserData = async (body, method) => {
  const { dni } = body;

  let data = createDataFromPlantilla("PLANTILLA_USUARIO", body, method);

  if (data.password) data.password = bcrypt.hashSync(data.password);

  if (await prisma.conductor.findUnique({ where: { dni: body.dni } })) {
    data.conductor = {
      connect: { dni },
    };
  }

  return data;
};

export const createTrayectoData = (body, method) => {
  let data = createDataFromPlantilla("PLANTILLA_TRAYECTO", body, method);

  if (data.horaSalida) data.horaSalida = new Date(data.horaSalida);
  if (data.horaLlegada) data.horaLlegada = new Date(data.horaLlegada);

  return data;
};

export const createConductorData = async (body, method, existing = null) => {
  let data = createDataFromPlantilla("PLANTILLA_CONDUCTOR", body, method);

  if (data.fechaNacimiento)
    data.fechaNacimiento = new Date(data.fechaNacimiento);

  if (data.image) {
    if (existing && existing.image) {
      if (existing.image.fromCloudinary)
        await cloudinary.uploader.destroy(existing.image.nombre);
      const id = existing.image.id;
      await prisma.image.delete({ where: { id } });
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

  if (data.vehiculo) {
    data.vehiculo = {
      connect: data.vehiculo.map((matricula) => ({ matricula })),
    };
  }

  if (
    data.dni &&
    (await prisma.user.findUnique({ where: { dni: data.dni } }))
  ) {
    data.userDni = data.dni;
  }

  if (method == "patch" && data.image == null) {
    data.image = {
      disconnect: true,
    };
  }

  return data;
};

export const createRevisionData = (body, method) => {
  let data = createDataFromPlantilla("PLANTILLA_REVISION", body, method);

  if (data.fecha) data.fecha = new Date(data.fecha);

  data.matriculaTexto = data.vehiculoMatricula;

  return data;
};

export const createVehiculoData = (body, method) => {
  let data = createDataFromPlantilla("PLANTILLA_VEHICULO", body, method);

  if (data.fechaCompra) data.fechaCompra = new Date(data.fechaCompra);
  if (data.fechaMatriculacion)
    data.fechaMatriculacion = new Date(data.fechaMatriculacion);

  if (data.imagenes) {
    data.imagenes = {
      connect: data.imagenes.map(({ id }) => ({ id })),
    };
  }

  if (data.revisiones) {
    data.revisiones = {
      connect: data.revisiones.map(({ id }) => ({ id })),
    };
  }

  if (data.averias) {
    data.averias = {
      connect: data.averias.map(({ id }) => ({ id })),
    };
  }

  if (data.viajes) {
    data.viajes = {
      connect: data.viajes.map(({ id }) => ({ id })),
    };
  }

  return data;
};

export const createViajeData = (body, method) => {
  let data = createDataFromPlantilla("PLANTILLA_VIAJE", body, method);

  data.trayectos.forEach((t) => {
    if (t.horaSalida) t.horaSalida = new Date(t.horaSalida);
    if (t.horaLlegada) t.horaLlegada = new Date(t.horaLlegada);
  });

  if (data.revisionId) {
    const revisionId = data.revisionId;
    data.revision = {
      connect: { revisionId },
    };
  }
  delete data.revisionId;

  if (data.trayectos) {
    data.trayectos = {
      connectOrCreate: data.trayectos.map((trayecto) => ({
        where: { id: trayecto.id || "00000000-0000-0000-0000-000000000000" },
        create: {
          horaSalida: trayecto.horaSalida,
          horaLlegada: trayecto.horaLlegada,
          origen: trayecto.origen,
          destino: trayecto.destino,
          distanciaEnKm: trayecto.distanciaEnKm,
        },
      })),
    };
  }
  return data;
};

export const createAveriaData = (body, method) => {
  let data = createDataFromPlantilla("PLANTILLA_AVERIA", body, method);

  if (data.fechaAveria) data.fechaAveria = new Date(data.fechaAveria);

  if (data.fechaComienzoReparacion)
    data.fechaComienzoReparacion = new Date(data.fechaComienzoReparacion);
  else data.fechaComienzoReparacion = null;

  if (data.fechaFinReparacion)
    data.fechaFinReparacion = new Date(data.fechaFinReparacion);
  else data.fechaFinReparacion = null;

  return data;
};

export const createPlantillaData = async (body, method) => {
  let data = createDataFromPlantilla(
    "PLANTILLA_PLANTILLA_REVISION",
    body,
    method,
  );

  if (data.rangos) {
    data.rangos = {
      create: data.rangos.map((r) => ({
        desdeAnyo: r.desdeAnyo,
        desdeKilometro: r.desdeKilometro,
        frecuenciaMeses: r.frecuenciaMeses,
        frecuenciaKilometros: r.frecuenciaKilometros,
      })),
    };
  }

  if (data.vehiculos) {
    data.vehiculos = {
      connect: data.vehiculos.map((matricula) => ({ matricula })),
    };
  }

  if (data.revisiones) {
    data.revisiones = {
      connect: data.revisiones.map((id) => ({ id })),
    };
  }

  return data;
};

export const createRangoData = (body, method) => {
  return createDataFromPlantilla("PLANTILLA_RANGO", body, method);
};
