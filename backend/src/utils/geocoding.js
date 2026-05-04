const axios = require("axios");
const logger = require("../logger");

const cache = new Map();

function buildFromAddress(parts) {
  const { direccion, localidad, ciudad, provincia, codigoPostal, pais } = parts;
  return [
    direccion,
    localidad,
    ciudad,
    provincia,
    codigoPostal,
    pais || "Espana",
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Devuelve { lat, lon } o null.
 * Intentos en orden:
 *   1. Nombre + ciudad + provincia  (busqueda por nombre del local)
 *   2. Nombre + direccion + ciudad  (nombre + calle)
 *   3. Direccion completa           (comportamiento anterior)
 *   4. Direccion sin localidad      (fallback)
 *   5. Solo codigo postal + ciudad  (ultimo recurso)
 */
async function geocodeAddress(params) {
  const basePais = params.pais || "Espana";

  const queries = [
    // 1. Nombre del restaurante + ciudad (el mas fiable en la practica)
    params.nombre
      ? [
          params.nombre,
          params.ciudad || params.localidad,
          params.provincia,
          basePais,
        ]
          .filter(Boolean)
          .join(", ")
      : null,

    // 2. Nombre + direccion exacta
    params.nombre
      ? [
          params.nombre,
          params.direccion,
          params.ciudad || params.localidad,
          basePais,
        ]
          .filter(Boolean)
          .join(", ")
      : null,

    // 3. Direccion completa (comportamiento original)
    buildFromAddress(params),

    // 4. Sin localidad duplicada
    buildFromAddress({
      direccion: params.direccion,
      localidad: params.localidad || params.ciudad,
      provincia: params.provincia,
      codigoPostal: params.codigoPostal,
      pais: basePais,
    }),

    // 5. Solo CP + ciudad (ultimo recurso para ubicacion aproximada)
    [
      params.codigoPostal,
      params.ciudad || params.localidad,
      params.provincia,
      basePais,
    ]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  // Eliminar duplicados manteniendo orden
  const uniqueQueries = [...new Set(queries)];

  for (const q of uniqueQueries) {
    if (cache.has(q)) {
      const cached = cache.get(q);
      if (cached) return cached;
      continue;
    }

    try {
      logger.info(`Geocoding: "${q}"`);
      const { data } = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q,
            format: "json",
            addressdetails: 1,
            limit: 3,
            countrycodes: "es",
          },
          headers: { "User-Agent": "DondeComemosHoy/1.0 (geocoding)" },
          timeout: 12000,
        },
      );

      const first = Array.isArray(data) && data.find(Boolean);
      const result = first
        ? { lat: parseFloat(first.lat), lon: parseFloat(first.lon) }
        : null;

      cache.set(q, result);

      if (result) {
        logger.info(
          `Geocoding OK: ${result.lat}, ${result.lon} (query: "${q}")`,
        );
        return result;
      } else {
        logger.warn(`Geocoding sin resultados para: "${q}"`);
      }
    } catch (err) {
      logger.error(`Error geocoding "${q}": %o`, err?.message || err);
    }
  }

  logger.warn(
    `Geocoding fallido para todos los intentos de: ${params.nombre || params.direccion}`,
  );
  return null;
}

module.exports = { geocodeAddress };
