import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createAveriaData } from "@/createEntityData";
import { verifyUser } from "@/userVerification";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const averia = await prisma.averia.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        user: true,
      },
    });

    if (!averia) {
      throw {
        code: 404,
        customMessage: "Averia no encontrada",
      };
    }

    return NextResponse.json(averia, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const body = await getUserVerifiedBody(request, await params);

    const existing = await prisma.averia.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
        customMessage: "Averia no encontrada",
      };
    }

    const data = createAveriaData(body, "patch");

    const updated = await prisma.averia.update({
      where: { id },
      data,
      include: {
        vehiculo: true,
        user: true,
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

    const existing = await prisma.averia.findUnique({ where: { id } });
    if (!existing) {
      throw {
        code: 404,
        customMessage: "Averia no encontrada",
      };
    }

    const deleted = await prisma.averia.delete({ where: { id } });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
