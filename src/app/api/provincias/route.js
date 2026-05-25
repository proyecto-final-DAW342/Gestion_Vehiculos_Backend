import { errorHandling } from "@/manejoStatus";
import { obtenerProvincias } from "@/services/gasolinerasAPI";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const provincias = await obtenerProvincias();

    return NextResponse.json(provincias, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
