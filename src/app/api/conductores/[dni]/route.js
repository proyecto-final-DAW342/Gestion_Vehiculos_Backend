import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt, { verify } from "jsonwebtoken";
import { verifyUser } from "@/actions";

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

  try {
    await verifyUser(request.headers.get("Authorization"));

    const existing = await prisma.conductor.findUnique({
      where: { dni },
      include: { image: true },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Conductor not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { nombre, apellidos, telefono, direccion, fechaNacimiento, imageId } =
      body;

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (apellidos !== undefined) data.apellidos = apellidos;
    if (telefono !== undefined) data.telefono = telefono;
    if (direccion !== undefined) data.direccion = direccion;
    if (fechaNacimiento !== undefined)
      data.fechaNacimiento = new Date(fechaNacimiento);
    if (imageId !== undefined) {
      if (existing.image)
        await prisma.images.delete({ where: { id: existing.image.id } });
      if (imageId !== null) {
        data.image = {
          connect: { id: imageId },
        };
      }
    }

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
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
