import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createViajeData } from "@/createEntityData";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const viajes = await prisma.viaje.findMany({
      take: limit,
      skip: offset,
      include: {
        vehiculo: true,
        conductor: true,
        revision: true,
        trayectos: true,
      },
    });

    return NextResponse.json(viajes, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    let body = await getUserVerifiedBody(request, "VIAJE");

    let data = createViajeData(body, "post");

    const viaje = await prisma.viaje.create({
      data,
      include: {
        vehiculo: true,
        conductor: true,
        revision: true,
        trayectos: true,
      },
    });

    return NextResponse.json(viaje, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
