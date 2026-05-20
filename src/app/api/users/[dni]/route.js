import { verifyUserAdmin, verifyUserAdminOrSameDni } from "@/userVerification";
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

    const data = await createUserData(body, "patch");

    const updatedUser = await prisma.user.update({
      where: { dni },
      data,
      include: {
        averias: true,
        conductor: true,
      },
    });

    if (
      updatedUser &&
      (await prisma.conductor.findUnique({ where: { dni } }))
    ) {
      await prisma.conductor.update({
        where: { dni },
        data,
      });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}

export async function DELETE(request, { params }) {
  const { dni } = await params;

  try {
    await verifyUserAdmin(request.headers.get("Authorization"));

    const existing = await prisma.user.findUnique({
      where: { dni },
    });
    if (!existing) {
      throw {
        code: 404,
      };
    }

    const deleted = await prisma.user.delete({ where: { dni } });
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
