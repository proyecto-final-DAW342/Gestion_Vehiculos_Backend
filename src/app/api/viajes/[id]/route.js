import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createViajeData } from "@/createEntityData";
import { verifyUser } from "@/userVerification";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        conductor: true,
        revision: true,
        trayectos: true,
      },
    });

    if (!viaje) {
      return NextResponse.json({ message: "Viaje not found" }, { status: 404 });
    }

    return NextResponse.json(viaje, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const existing = await prisma.viaje.findUnique({ where: { id } });
    if (!existing) {
      throw { code: 404 };
    }

    const body = await getUserVerifiedBody(request, "VIAJE", params);
    const data = createViajeData(body, "patch");

    const updated = await prisma.viaje.update({
      where: { id },
      data,
      include: {
        vehiculo: true,
        conductor: true,
        revision: true,
        trayectos: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await verifyUser(request, params);

    const existing = await prisma.viaje.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Viaje not found" }, { status: 404 });
    }

    const deleted = await prisma.viaje.delete({
      where: { id },
      include: {
        vehiculo: true,
        conductor: true,
        revision: true,
        trayectos: true,
      },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
