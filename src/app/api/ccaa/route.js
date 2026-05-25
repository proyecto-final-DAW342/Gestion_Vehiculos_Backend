import { errorHandling } from "@/manejoStatus";
import { obtenerCCAA } from "@/services/gasolinerasAPI";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ccaa = await obtenerCCAA();

    return NextResponse.json(ccaa, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
