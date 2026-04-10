import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/actions";
import { errorHandling } from "@/manejoStatus";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const imagenes = await prisma.images.findMany({
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
    await verifyUser(request.headers.get("Authorization"));

    const { url, nombre } = await request.json();

    const query = await prisma.images.create({
      data: {
        url,
        nombre,
      },
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
