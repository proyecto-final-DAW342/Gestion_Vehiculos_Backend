import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getBodyFromRequest, verifyUser } from "@/actions";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    if (!id) throw { code: 400 };

    const revision = await prisma.revision.findUnique({
      where: { id },
      include: {
        vehiculo: true,
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
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.revision.findUnique({ where: { id } });
    if (!existing) {
      throw 404;
    }

    const body = getBodyFromRequest(request);
    const data = createDataRevision(body);

    const updated = await prisma.revision.update({
      where: { id },
      data,
      include: {
        vehiculo: true,
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
