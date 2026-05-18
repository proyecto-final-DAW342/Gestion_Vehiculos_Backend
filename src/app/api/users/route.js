import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyUser } from "@/userVerification";
import { errorHandling } from "@/manejoStatus";

export async function GET(request) {
  try {
    await verifyUser(request);

    const users = await prisma.user.findMany({
      include: {
        averias: true,
        conductor: true,
      },
    });

    if (!users) {
      throw { code: 404 };
    }

    // Remove password from the response
    const { password, ...usersWithoutPassword } = users;

    return NextResponse.json(usersWithoutPassword, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
