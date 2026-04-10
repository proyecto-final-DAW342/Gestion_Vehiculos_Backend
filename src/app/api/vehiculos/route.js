import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyUser } from "@/actions";
import { errorHandling } from "@/manejoStatus";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const vehiculos = await prisma.vehiculo.findMany({
      take: limit,
      skip: offset,
      include: {
        conductor: true,
        averia: true,
        imagenes: true,
      },
    });

    return NextResponse.json(vehiculos, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await verifyUser(request.headers.get("Authorization"));

    const {
      matricula,
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
    } = await request.json();

    if (
      !matricula ||
      !marca ||
      !modelo ||
      !fechaCompra ||
      !anyosAntiguedad ||
      !tipo ||
      kilometrosTotales === undefined ||
      !alimentacion ||
      nuevo === undefined ||
      gastoPorKm === undefined
    ) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const data = {
      matricula,
      marca,
      modelo,
      fechaCompra: new Date(fechaCompra),
      anyosAntiguedad,
      tipo,
      kilometrosTotales,
      alimentacion,
      precio: precio || 0,
      nuevo,
      gastoPorKm,
    };

    if (conductorDni) data.conductorDni = conductorDni;
    if (averiaId) data.averiaId = averiaId;
    if (imagenes && imagenes.length > 0) {
      data.imagenes = {
        connect: imagenes.map(({ id }) => ({ id })),
      };
    }

    const vehiculo = await prisma.vehiculo.create({
      data,
      include: {
        conductor: true,
        averia: true,
        imagenes: true,
      },
    });

    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error) {
    if (error.code === "P2002")
      return errorHandling(
        error,
        "Ya existe un vehículo con esa matrícula o marca",
      );

    return errorHandling(error);
  }
}
