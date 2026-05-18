import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyUser } from "@/userVerification";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createTrayectoData } from "@/createEntityData";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const trayecto = await prisma.trayecto.findUnique({
      where: { id },
      include: {
        viaje: true,
      },
    });

    if (!trayecto) {
      throw {
        code: 404,
      };
    }

    return NextResponse.json(trayecto, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const existing = await prisma.trayecto.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
      };
    }

    const body = await getUserVerifiedBody(request, await params);

    const data = createTrayectoData(body, "patch");

    const updated = await prisma.trayecto.update({
      where: { id },
      data,
      include: {
        viaje: true,
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
    await verifyUser(request, await params);

    const existing = await prisma.trayecto.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
      };
    }

    const deleted = await prisma.trayecto.delete({
      where: { id },
      include: { viaje: true },
    });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
