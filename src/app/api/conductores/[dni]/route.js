import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  getBodyFromFormData,
  getBodyFromRequest,
  uploadFile,
  verifyUser,
} from "@/actions";
import { errorHandling } from "@/manejoStatus";
import { createConductorData } from "@/createEntityData";

export async function GET(request, { params }) {
  const { dni } = await params;

  try {
    const conductor = await prisma.conductor.findUnique({
      where: { dni },
      include: {
        vehiculo: true,
      },
    });

    if (!conductor) {
      return NextResponse.json(
        { message: "Conductor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(conductor, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  const { dni } = await params;
  let body;

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.conductor.findUnique({
      where: { dni },
      include: { image: true },
    });
    if (!existing) {
      throw { code: 404 };
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await getBodyFromRequest(request);
      if (body.image !== undefined && body.image)
        body.image.fromCloudinary = false;
    } else if (contentType.includes("multipart/form-data")) {
      body = await getBodyFromFormData(request);
    }

    const data = await createConductorData(body, "patch", existing);

    const updatedConductor = await prisma.conductor.update({
      where: { dni },
      data,
      include: {
        image: true,
        vehiculo: true,
      },
    });

    return NextResponse.json(updatedConductor, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function DELETE(request, { params }) {
  const { dni } = await params;

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.conductor.findUnique({ where: { dni } });
    if (!existing) {
      return NextResponse.json(
        { message: "Conductor not found" },
        { status: 404 },
      );
    }

    const deleted = await prisma.conductor.delete({ where: { dni } });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
