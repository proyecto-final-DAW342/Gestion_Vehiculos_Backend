import { errorHandling } from "@/manejoStatus";
import { obtenerMunicipios } from "@/services/gasolinerasAPI";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const municipios = await obtenerMunicipios();

    return NextResponse.json(municipios, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
