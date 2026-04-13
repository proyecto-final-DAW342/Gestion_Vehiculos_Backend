import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getBodyFromRequest, verifyUser } from "@/actions";
import { createVehiculoData } from "@/createEntityData";

export async function GET(request, { params }) {
  const { matricula } = await params;

  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { matricula },
      include: {
        conductor: true,
        averias: true,
        revisiones: true,
        imagenes: true,
      },
    });

    if (!vehiculo) {
      throw 404;
    }

    return NextResponse.json(vehiculo, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { matricula } = await params;

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.vehiculo.findUnique({ where: { matricula } });
    if (!existing) {
      throw { code: 404 };
    }

    const body = await getBodyFromRequest(request);
    const data = createVehiculoData(body, "patch");

    const updated = await prisma.vehiculo.update({
      where: { matricula },
      data,
      include: {
        conductor: true,
        averias: true,
        revisiones: true,
        imagenes: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function DELETE(request, { params }) {
  const { matricula } = await params;

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.vehiculo.findUnique({ where: { matricula } });
    if (!existing) {
      throw 404;
    }

    const deleted = await prisma.vehiculo.delete({
      where: { matricula },
      include: {
        imagenes: true,
      },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
