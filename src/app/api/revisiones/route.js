import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createRevisionData } from "@/createEntityData";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;

  const offset = +searchParams.get("offset") || 0;
  const limit = +searchParams.get("limit") || 10;
  const visibleParam = searchParams.get("visible");

  const revisionesFiltros = {
    all: undefined,
    false: false,
  };

  const filtro =
    visibleParam in revisionesFiltros ? revisionesFiltros[visibleParam] : true;

  try {
    const revisiones = await prisma.revision.findMany({
      take: limit,
      skip: offset,
      where: {
        visible: filtro, //http://localhost:3000/api/revisiones?visible=all
      },
      include: {
        vehiculo: true,
        viaje: true,
      },
    });

    return NextResponse.json(revisiones, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request, "REVISION");

    const data = createRevisionData(body, "post");

    const revision = await prisma.revision.create({
      data,
      include: {
        vehiculo: true,
        viaje: true,
      },
    });

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
