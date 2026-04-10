import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { verifyUser } from "@/actions";

export async function GET(request, { params }) {
  const { matricula } = await params;

  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { matricula },
      include: {
        conductor: true,
        averia: true,
        imagenes: true,
      },
    });

    if (!vehiculo) {
      throw 404;
    }

    return NextResponse.json(vehiculo, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { matricula } = await params;

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.vehiculo.findUnique({ where: { matricula } });
    if (!existing) {
      throw 404;
    }

    const body = await request.json().catch(() => {
      throw 400;
    });
    if (!body) throw 400;

    const {
      marca,
      modelo,
      fechaCompra,
      anyosAntiguedad,
      tipo,
      kilometrosTotales,
      alimentacion,
      precio,
      nuevo,
      gastoPorKm,
      conductorDni,
      averiaId,
      imagenes,
    } = body;

    const data = {};
    if (marca !== undefined) data.marca = marca;
    if (modelo !== undefined) data.modelo = modelo;
    if (fechaCompra !== undefined) data.fechaCompra = new Date(fechaCompra);
    if (anyosAntiguedad !== undefined) data.anyosAntiguedad = anyosAntiguedad;
    if (tipo !== undefined) data.tipo = tipo;
    if (kilometrosTotales !== undefined)
      data.kilometrosTotales = kilometrosTotales;
    if (alimentacion !== undefined) data.alimentacion = alimentacion;
    if (precio !== undefined) data.precio = precio;
    if (nuevo !== undefined) data.nuevo = nuevo;
    if (gastoPorKm !== undefined) data.gastoPorKm = gastoPorKm;
    if (conductorDni !== undefined) data.conductorDni = conductorDni;
    if (averiaId !== undefined) data.averiaId = averiaId;
    if (imagenes !== undefined) {
      data.imagenes = {
        connectOrCreate: imagenes.map(({ id, url, nombre }) => ({
          where: { id },
          create: { id, url, nombre },
        })),
      };
    }

    const updated = await prisma.vehiculo.update({
      where: { matricula },
      data,
      include: {
        conductor: true,
        averia: true,
        imagenes: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function DELETE(request, { params }) {
  const { matricula } = await params;

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.vehiculo.findUnique({ where: { matricula } });
    if (!existing) {
      throw 404;
    }

    const deleted = await prisma.vehiculo.delete({
      where: { matricula },
      include: {
        imagenes: true,
      },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
