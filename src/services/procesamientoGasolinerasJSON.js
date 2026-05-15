import {
  obtenerEstacionesMunicipio,
  obtenerMunicipiosDeProvincia,
  obtenerProvinciasDeCCAA,
} from "./gasolinerasAPI";

export const parsearPreciosConComas = (lista) => {
  if (lista.ListaEESSPrecio) {
    lista.ListaEESSPrecio.forEach((e) => {
      e.PrecioProducto = Number(e.PrecioProducto.replace(",", "."));
    });
  }
};

export const obtenerPrecioMedioGasolineras = (lista) => {
  let listaPrecios = lista.ListaEESSPrecio.map((l) => {
    return l.PrecioProducto;
  });

  let total = listaPrecios.reduce((a, b) => a + b, 0);

  return Number((total / lista.ListaEESSPrecio.length).toFixed(3));
};

export const obtenerGasolineraMasBarata = (lista) => {
  let masBarata;
  lista.ListaEESSPrecio.forEach((e) => {
    e.PrecioProducto = e.PrecioProducto;
    if (!masBarata) {
      masBarata = e;
    }

    if (e.PrecioProducto < masBarata.PrecioProducto) {
      masBarata = e;
    }
  });

  return masBarata;
};

const obtenerMunicipiosDeListaGasolinearasProvicia = (lista) => {
  let listaIdAgregado = [];
  let listaMunicipios = [];
  lista.ListaEESSPrecio.forEach((e) => {
    if (listaIdAgregado.indexOf(e.IDMunicipio) == -1) {
      listaMunicipios.push({
        IDMunicipio: e.IDMunicipio,
        Municipio: e.Municipio,
      });
      listaIdAgregado.push(e.IDMunicipio);
    }
  });

  return listaMunicipios;
};

export const parsearEstacionesCCAA = async (idCCAA, estacionesCCAA) => {
  let resultado;
  const provincias = await obtenerProvinciasDeCCAA(idCCAA); //Este al ser una lista más larga que recorrer, directamente llamo a la api ya que en cualquier caso se llamará como mucho una vez

  resultado = provincias.map((p) => {
    let listaEstaciones = {
      ListaEESSPrecio: [],
    };

    estacionesCCAA.ListaEESSPrecio.forEach((e) => {
      if (e.IDProvincia == p.IDPovincia) {
        listaEstaciones.ListaEESSPrecio.push(e);
      }
    });

    return {
      provincia: p.Provincia,
      municipios: parsearEstacionesProvincia(listaEstaciones),
    };
  });

  return resultado;
};

export const parsearEstacionesProvincia = (estacionesProvincia) => {
  let resultado;
  const municipios =
    obtenerMunicipiosDeListaGasolinearasProvicia(estacionesProvincia);
  //Problema a mencionar: como no puedo hacer demasiadas llamadas a la api, tengo que parsear los datos de los archivos que ya tengo, entonces para obtener los municipios lo tengo que hacer en base a la lista que ya me envía el usuario porque si no, al devolver la lista de comunidades autónomas, tengo que preguntar por todos los municipios de todas las provincias de todas las comunidades. También para buscar las gasolineras no puedo llamar a la api para que me las devuelva sin más porque sería de nuevo un montón de llamadas, tengo que buscar las que coincidan en la lista que ya tengo

  resultado = municipios.map((m) => {
    let listaEstaciones = {
      ListaEESSPrecio: [],
    };
    estacionesProvincia.ListaEESSPrecio.forEach((e) => {
      if (e.IDMunicipio == m.IDMunicipio) {
        listaEstaciones.ListaEESSPrecio.push(e);
      }
    });

    return {
      municipio: m.Municipio,
      estaciones: parsearEstacionesMunicipio(listaEstaciones),
    };
  });

  return resultado;
};

export const parsearEstacionesMunicipio = (lista) => {
  return lista.ListaEESSPrecio.map((e) => {
    return {
      direccion: e.Dirección,
      precio: e.PrecioProducto,
      latitud: e.Latitud,
      "longitud (WGS84)": e["Longitud (WGS84)"],
    };
  });
};
