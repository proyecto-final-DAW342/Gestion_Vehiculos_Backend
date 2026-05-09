import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createRangoData } from "@/createEntityData";
import { verifyUser } from "@/userVerification";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const rango = await prisma.rango.findUnique({
      where: { id },
      include: {
        plantilla: true,
      },
    });

    if (!rango) {
      throw {
        code: 404,
        customMessage: "Rango no encontrada",
      };
    }

    return NextResponse.json(rango, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const body = await getUserVerifiedBody(request, "RANGO", await params);

    const existing = await prisma.rango.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
        customMessage: "Rango no encontrado",
      };
    }

    const data = createRangoData(body, "patch");

    const updated = await prisma.rango.update({
      where: { id },
      data,
      include: {
        plantilla: true,
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
    verifyUser(request, await params);

    const existing = await prisma.rango.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
        customMessage: "Rango no encontrado",
      };
    }

    const deleted = await prisma.rango.delete({ where: { id } });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
