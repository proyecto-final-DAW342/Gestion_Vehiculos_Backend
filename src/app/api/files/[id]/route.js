import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { errorHandling } from "@/manejoStatus";
import { verifyUser } from "@/userVerification";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const imagen = await prisma.image.findUnique({
      where: { id },
      include: {
        conductor: true,
        vehiculo: true,
      },
    });

    if (!imagen) {
      throw {
        code: 404,
      };
    }

    return NextResponse.json(imagen, { status: 200 });
  } catch (error) {
    errorHandling(error);
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await verifyUser(request);

    const existing = await prisma.image.findUnique({ where: { id } });
    if (!existing) {
      throw { code: 404 };
    }

    const deleted = await prisma.image.delete({
      where: { id },
      include: {
        conductor: true,
        vehiculo: true,
      },
    });

    if (deleted.fromCloudinary)
      await cloudinary.uploader.destroy(deleted.nombre);

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
