import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorHandling } from "@/manejoStatus";
import { getUserVerifiedBody } from "@/actions";
import { createUserData } from "@/createEntityData";

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request, "USER");

    const data = await createUserData(body, "post");
    const user = await prisma.user.create({
      data,
    });

    const { password, ...userNoPass } = user;

    return NextResponse.json(userNoPass, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
