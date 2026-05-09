export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;

  const offset = +searchParams.get("offset") || 0;
  const limit = +searchParams.get("limit") || 10;
  const fecha = searchParams.get("fecha");

  try {
    const revisiones = await prisma.revision.findMany({
      take: limit,
      skip: offset,
      where: {
        visible: filtro, //http://localhost:3000/api/revisiones?visible=all
      },
      include: {
        vehiculo: true,
        viaje: true,
      },
    });

    return NextResponse.json(revisiones, { status: 200 });
  } catch (error) {
    return errorHandling(error);
  }
}
