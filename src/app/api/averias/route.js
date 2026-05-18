import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createAveriaData } from "@/createEntityData";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const averias = await prisma.averia.findMany({
      take: limit,
      skip: offset,
      include: {
        vehiculo: true,
        user: true,
      },
    });

    return NextResponse.json(averias, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request);

    const data = createAveriaData(body, "post");

    const averia = await prisma.averia.create({
      data,
      include: {
        vehiculo: true,
        user: true,
      },
    });

    return NextResponse.json(averia, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
