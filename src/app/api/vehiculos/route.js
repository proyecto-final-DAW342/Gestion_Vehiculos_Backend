import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserVerifiedBody } from "@/actions";
import { errorHandling } from "@/manejoStatus";
import { createVehiculoData } from "@/createEntityData";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const vehiculos = await prisma.vehiculo.findMany({
      take: limit,
      skip: offset,
      include: {
        conductor: true,
        plantilla: true,
        averias: true,
        revisiones: true,
        imagenes: true,
      },
    });

    return NextResponse.json(vehiculos, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request, "VEHICULO");

    const data = createVehiculoData(body, "post");

    const vehiculo = await prisma.vehiculo.create({
      data,
      include: {
        conductor: true,
        plantilla: true,
        averias: true,
        revisiones: true,
        imagenes: true,
      },
    });

    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
