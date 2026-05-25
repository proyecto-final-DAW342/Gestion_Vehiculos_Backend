import { errorHandling } from "@/manejoStatus";
import { obtenerProvinciasDeCCAA } from "@/services/gasolinerasAPI";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const provincias = await obtenerProvinciasDeCCAA(id);
    return NextResponse.json(provincias, { status: 200 });
  } catch (error) {
    errorHandling(error);
  }
}
