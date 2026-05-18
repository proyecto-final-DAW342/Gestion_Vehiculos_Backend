import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { createConductorData } from "@/createEntityData";
import { getUserVerifiedBody } from "@/actions";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const conductores = await prisma.conductor.findMany({
      take: limit,
      skip: offset,
      include: {
        image: true,
        vehiculo: true,
        user: true,
        viajes: true,
      },
    });

    return NextResponse.json(conductores, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request);

    const data = await createConductorData(body, "post");

    const conductor = await prisma.conductor.create({
      data,
      include: {
        image: true,
        vehiculo: true,
        user: true,
        viajes: true,
      },
    });

    return NextResponse.json(conductor, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
