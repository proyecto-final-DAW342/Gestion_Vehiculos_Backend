import { errorHandling } from "@/manejoStatus";
import { obtenerMunicipiosDeProvincia } from "@/services/gasolinerasAPI";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const provincias = await obtenerMunicipiosDeProvincia(id);
    return NextResponse.json(provincias, { status: 200 });
  } catch (error) {
    errorHandling(error);
  }
}
