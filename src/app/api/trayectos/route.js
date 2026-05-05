import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { createTrayectoData } from "@/createEntityData";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const trayectos = await prisma.trayecto.findMany({
      take: limit,
      skip: offset,
      include: {
        viaje: true,
      },
    });

    return NextResponse.json(trayectos, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = getBody(request, "TRAYECTO");

    const data = createTrayectoData(body, "post");

    const trayecto = await prisma.trayecto.create({
      data,
      include: {
        viaje: true,
      },
    });

    return NextResponse.json(trayecto, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
