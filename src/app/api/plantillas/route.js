import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createPlantillaData } from "@/createEntityData";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const plantillas = await prisma.plantilla.findMany({
      take: limit,
      skip: offset,
      include: {
        rangos: true,
        vehiculos: true,
        revisiones: true,
      },
    });

    return NextResponse.json(plantillas, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request, "PLANTILLA");

    const data = await createPlantillaData(body, "post");

    const plantilla = await prisma.plantilla.create({
      data,
      include: {
        rangos: true,
        vehiculos: true,
        revisiones: true,
      },
    });

    return NextResponse.json(plantilla, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
