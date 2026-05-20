import { verifyUserAdminOrSameDni } from "@/userVerification";
import { createUserData } from "@/createEntityData";
import prisma from "@/lib/prisma";
import { errorHandling } from "@/manejoStatus";
import { NextResponse } from "next/server";
import { getUserVerifiedBody } from "@/actions";

export async function GET(request, { params }) {
  const { dni } = await params;

  try {
    await verifyUserAdminOrSameDni(request.headers.get("Authorization"), dni);

    const user = await prisma.user.findUnique({
      where: { dni },
      include: {
        averias: true,
        conductor: true,
      },
    });

    if (!user) {
      throw { code: 404 };
    }

    // Remove password from the response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function PATCH(request, { params }) {
  const { dni } = await params;

  try {
    await verifyUserAdminOrSameDni(request.headers.get("Authorization"), dni);

    const body = await getUserVerifiedBody(request);

    const data = createUserData(body, "patch");

    const updatedConductor = await prisma.user.update({
      where: { dni },
      data,
      include: {
        averias: true,
        conductor: true,
      },
    });

    return NextResponse.json(updatedConductor, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
