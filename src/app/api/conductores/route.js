import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { verifyUser } from "@/actions";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const conductores = await prisma.conductor.findMany({
      take: limit,
      skip: offset,
      include: {
        vehiculo: true,
        image: true,
      },
    });

    return NextResponse.json(conductores, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  try {
    await verifyUser(request.headers.get("Authorization"));

    const {
      dni,
      nombre,
      apellidos,
      telefono,
      direccion,
      fechaNacimiento,
      imageId,
    } = await request.json();

    if (
      !dni ||
      !nombre ||
      !apellidos ||
      !telefono ||
      !direccion ||
      !fechaNacimiento
    ) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const conductor = await prisma.conductor.create({
      data: {
        dni,
        nombre,
        apellidos,
        telefono,
        direccion,
        ...(imageId && {
          image: {
            connect: { id: Number(imageId) }, // Asegúrate de que sea Number si tu ID es Int
          },
        }),
        fechaNacimiento: new Date(fechaNacimiento),
      },
      include: {
        image: true,
        vehiculo: true,
      },
    });

    return NextResponse.json(conductor, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
