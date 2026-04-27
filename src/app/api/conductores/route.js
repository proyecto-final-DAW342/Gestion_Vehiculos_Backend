import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { errorHandling } from "@/manejoStatus";
import { getBodyFromFormData, getVerifiedBody } from "@/actions";
import { createConductorData } from "@/createEntityData";
import { verifyConductorBody } from "@/verifyEntityBody";

export async function GET(request) {
  const offset = +request.nextUrl.searchParams.get("offset") || 0;
  const limit = +request.nextUrl.searchParams.get("limit") || 10;

  try {
    const conductores = await prisma.conductor.findMany({
      take: limit,
      skip: offset,
      include: {
        vehiculo: true,
        image: true,
      },
    });

    return NextResponse.json(conductores, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function POST(request) {
  let body;
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await getVerifiedBody(request, "CONDUCTOR");
      if (body.image) {
        body.image.fromCloudinary = false;
      }
    } else if (contentType.includes("multipart/form-data")) {
      body = await getBodyFromFormData(request);
      verifyConductorBody(body);
    }

    const data = await createConductorData(body, "post");

    const conductor = await prisma.conductor.create({
      data,
      include: {
        image: true,
        vehiculo: true,
      },
    });

    return NextResponse.json(conductor, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
