import { NextResponse } from "next/server";
import { verifyUser } from "@/userVerification";
import { errorHandling } from "@/manejoStatus";

export async function GET(request) {
  try {
    const user = await verifyUser(request);
    const { email, fullName, isActive, roles } = user;
    return NextResponse.json(
      { email, fullName, isActive, roles },
      { status: 200 },
    );
  } catch (error) {
    return errorHandling(error);
  }
}
