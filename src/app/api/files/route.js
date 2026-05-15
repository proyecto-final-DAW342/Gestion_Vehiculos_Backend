import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/userVerification";
import { errorHandling } from "@/manejoStatus";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const imagenes = await prisma.image.findMany({
      take: limit,
      skip: offset,
      include: {
        conductor: true,
        vehiculo: true,
      },
    });

    return NextResponse.json(imagenes, { status: 200 });
  } catch (error) {
    console.log(error);
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    await verifyUser(request);

    const { url, nombre, vehiculoMatricula, conductorDni } =
      await request.json();

    const query = await prisma.image.create({
      data: {
        url,
        nombre,
        fromCloudinary: false,
        vehiculoMatricula,
        conductorDni,
      },
      include: {
        vehiculo: true,
        conductor: true,
      },
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
