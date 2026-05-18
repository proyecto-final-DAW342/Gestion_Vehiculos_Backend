import { getUserVerifiedBody } from "@/actions";
import { createEstacionData } from "@/createEntityData";
import { errorHandling } from "@/manejoStatus";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await getUserVerifiedBody(request);

    const data = await createEstacionData(body, "post");

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorHandling(error);
  }
}
