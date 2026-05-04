import { getBody } from "@/actions";
import { createUserData } from "@/createEntityData";
import prisma from "@/lib/prisma";
import { errorHandling } from "@/manejoStatus";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { dni } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { dni },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove password from the response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error fetching user by DNI:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  const { dni } = await params;

  try {
    const body = await getBody(request, "USER");

    const data = createUserData(body);

    const updatedConductor = await prisma.user.update({
      where: { dni },
      data,
      include: {
        conductor: true,
      },
    });

    return NextResponse.json(updatedConductor, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
