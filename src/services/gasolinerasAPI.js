import { parsearPreciosConComas } from "./procesamientoGasolinerasJSON";

const URL_BASE =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/";

export async function obtenerProvinciasDeCCAA(idCCAA) {
  const provincias = await fetch(
    `${URL_BASE}Listados/ProvinciasPorComunidad/${idCCAA}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return provincias;
}

export async function obtenerMunicipiosDeProvincia(idProvincia) {
  const municipios = await fetch(
    `${URL_BASE}Listados/MunicipiosPorProvincia/${idProvincia}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return municipios;
}

export async function obtenerEstacionesCCAA(idCCAA, idProducto) {
  const estaciones = await fetch(
    `${URL_BASE}EstacionesTerrestres/FiltroCCAAProducto/${idCCAA}/${idProducto}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  parsearPreciosConComas(estaciones);

  return estaciones;
}

export async function obtenerEstacionesProvincia(idProvincia, idProducto) {
  const estaciones = await fetch(
    `${URL_BASE}EstacionesTerrestres/FiltroProvinciaProducto/${idProvincia}/${idProducto}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  parsearPreciosConComas(estaciones);

  return estaciones;
}

export async function obtenerEstacionesMunicipio(idMunicipio, idProducto) {
  const estaciones = await fetch(
    `${URL_BASE}EstacionesTerrestres/FiltroMunicipioProducto/${idMunicipio}/${idProducto}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  parsearPreciosConComas(estaciones);

  return estaciones;
}
