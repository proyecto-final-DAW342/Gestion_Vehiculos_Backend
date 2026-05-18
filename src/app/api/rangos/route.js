import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createRangoData } from "@/createEntityData";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const rangos = await prisma.rango.findMany({
      take: limit,
      skip: offset,
      include: {
        plantilla: true,
      },
    });

    return NextResponse.json(rangos, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request);

    const data = createRangoData(body, "post");

    const rango = await prisma.rango.create({
      data,
      include: {
        plantilla: true,
      },
    });

    return NextResponse.json(rango, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
