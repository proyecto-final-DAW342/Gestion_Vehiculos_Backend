import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const imagenes = await prisma.images.findMany({
      take: limit,
      skip: offset,
      include: {
        conductor: true,
        vehiculo: true,
      },
    });

    return NextResponse.json(imagenes, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = authHeader.split(" ")[1] || authHeader;

  try {
    // VERIFICAMOS TOKEN
    const { dni } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { dni } });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Token expired or invalid." },
        { status: 401 },
      );
    }

    const { url, nombre } = await request.json();

    const query = await prisma.images.create({
      data: {
        url,
        nombre,
      },
    });

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error(error);
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Token invalid or expired." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
