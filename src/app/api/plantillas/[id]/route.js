import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createPlantillaData } from "@/createEntityData";
import { verifyUser } from "@/userVerification";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const plantilla = await prisma.plantilla.findUnique({
      where: { id },
      include: {
        rangos: true,
        vehiculos: true,
        revisiones: true,
      },
    });

    if (!plantilla) {
      throw {
        code: 404,
        customMessage: "Plantilla no encontrada",
      };
    }

    return NextResponse.json(plantilla, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const body = await getUserVerifiedBody(request, await params);

    const existing = await prisma.plantilla.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
        customMessage: "Plantilla no encontrada",
      };
    }

    const data = await createPlantillaData(body, "patch");

    const updated = await prisma.plantilla.update({
      where: { id },
      data,
      include: {
        rangos: true,
        vehiculos: true,
        revisiones: true,
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

    const existing = await prisma.plantilla.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
        customMessage: "Plantilla no encontrada",
      };
    }

    const deleted = await prisma.plantilla.delete({ where: { id } });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
