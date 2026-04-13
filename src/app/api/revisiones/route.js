import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { verifyUser } from "@/actions";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const revisiones = await prisma.revision.findMany({
      take: limit,
      skip: offset,
    });

    return NextResponse.json(revisiones, { status: 200 });
  } catch (error) {
    console.log(error);
    return errorHandling(500);
  }
}

export async function POST(request) {
  try {
    await verifyUser(request.headers.get("Authorization"));

    const { fecha, lugar, aprobada } = await request.json();

    if (!fecha || !lugar || aprobada === undefined) {
      throw { code: 400 };
    }

    const revision = await prisma.revision.create({
      data: {
        fecha: new Date(fecha),
        lugar,
        aprobada,
      },
    });

    return NextResponse.json(revision, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
