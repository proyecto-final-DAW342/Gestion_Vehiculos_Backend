import nodeCron from "node-cron";
import prisma from "./lib/prisma";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    nodeCron.schedule(
      "0 0 * * *",
      async () => {
        const msPorAnio = 1000 * 60 * 60 * 24 * 365.25;

        const plantillas = await prisma.plantilla.findMany({
          include: {
            rangos: true,
            vehiculos: true,
            revisiones: true,
          },
        });

        plantillas.forEach(async (p) => {
          p.vehiculos.forEach(async (v) => {
            //Valor en base al cual calcular la frecuencia
            let rangoActual;

            if (p.trigger == "ANYO") {
              const antiguedadDecimal =
                (new Date() - v.fechaMatriculacion) / msPorAnio;
              const antiguedad = Math.floor(antiguedadDecimal);

              p.rangos.forEach((r) => {
                if (r.desdeAnyo <= antiguedad) {
                  rangoActual = r;
                }
              });
            }

            if (p.trigger == "KM") {
              const km = v.kilometrosTotales;

              p.rangos.forEach((r) => {
                if (r.desdeKilometro <= km) {
                  rangoActual = r;
                }
              });
            }

            //Frecuencia para agregar nueva revisión
            if (rangoActual) {
              if (p.frecuencia == "MESES" && p.revisiones.length) {
                const idRevisiones = p.revisiones.map((rev) => {
                  return rev.id;
                });

                let ultimaRevision = await prisma.revision.findFirst({
                  where: {
                    id: {
                      in: idRevisiones,
                    },
                  },
                  orderBy: {
                    fecha: "desc",
                  },
                });

                if (ultimaRevision.fecha < new Date()) {
                  let nuevaFecha = new Date(ultimaRevision.fecha);
                  nuevaFecha.setMonth(
                    nuevaFecha.getMonth() + rangoActual.frecuenciaMeses,
                  );
                  nuevaFecha.setDate(nuevaFecha.getDate() + p.margenDias);

                  await prisma.revision.create({
                    data: {
                      descripcion: p.nombre,
                      fecha: nuevaFecha,
                      visible: true,
                      esItv: p.esItv,
                      matriculaTexto: v.matricula,
                      vehiculoMatricula: v.matricula,
                      plantillaId: p.id,
                    },
                  });
                }
              }

              if (p.frecuencia == "KM") {
                const idRevisiones = p.revisiones.map((rev) => {
                  return rev.id;
                });

                const ultimaRevision = await prisma.revision.findFirst({
                  where: {
                    id: {
                      in: idRevisiones,
                    },
                  },
                  orderBy: {
                    fecha: "desc",
                  },
                  include: {
                    viaje: true,
                  },
                });

                if (
                  !ultimaRevision ||
                  (ultimaRevision.fecha < new Date() &&
                    v.kilometrosTotales - ultimaRevision.kilometrosActuales >=
                      rangoActual.frecuenciaKilometros)
                ) {
                  let nuevaFecha = new Date();
                  nuevaFecha.setDate(nuevaFecha.getDate() + p.margenDias);

                  await prisma.revision.create({
                    data: {
                      descripcion: p.nombre,
                      fecha: nuevaFecha,
                      visible: true,
                      esItv: p.esItv,
                      matriculaTexto: v.matricula,
                      vehiculoMatricula: v.matricula,
                      plantillaId: p.id,
                    },
                  });
                }
              }
            }
          });
        });
      },
      { scheduled: true, timezone: "Europe/Madrid" },
    );
  }
}
