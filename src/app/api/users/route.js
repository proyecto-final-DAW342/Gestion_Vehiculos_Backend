import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyUserAdmin } from "@/userVerification";
import { errorHandling } from "@/manejoStatus";

export async function GET(request) {
  try {
    await verifyUserAdmin(request.headers.get("Authorization"));

    const users = await prisma.user.findMany({
      include: {
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
