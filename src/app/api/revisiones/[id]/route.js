import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { verifyUser } from "@/userVerification";
import { createRevisionData } from "@/createEntityData";
import { getUserVerifiedBody } from "@/actions";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    if (!id) throw { code: 400 };

    const revision = await prisma.revision.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        viaje: true,
        plantilla: true,
      },
    });

    if (!revision) {
      throw { code: 404 };
    }

    return NextResponse.json(revision, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  try {
    const existing = await prisma.revision.findUnique({ where: { id } });
    if (!existing) {
      throw { code: 404 };
    }

    const body = await getUserVerifiedBody(request, "REVISION");
    const data = createRevisionData(body, "patch");

    const updated = await prisma.revision.update({
      where: { id },
      data,
      include: {
        vehiculo: true,
        viaje: true,
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
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.vehiculo.findUnique({ where: { id } });
    if (!existing) {
      throw { code: 404 };
    }

    const deleted = await prisma.vehiculo.delete({
      where: { id },
      include: {
        imagenes: true,
      },
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
