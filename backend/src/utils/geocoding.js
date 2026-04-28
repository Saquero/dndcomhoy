const axios = require("axios");
const logger = require("../logger");

const cache = new Map();

function build(parts) {
  const { direccion, localidad, ciudad, provincia, codigoPostal, pais } = parts;
  return [
    direccion,
    localidad,
    ciudad,
    provincia,
    codigoPostal,
    pais || "España",
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Devuelve { lat, lon } o null. Hasta 4 intentos con formatos distintos.
 */
async function geocodeAddress(params) {
  const basePais = params.pais || "España";
  const q1 = build(params);
  const q2 = build({
    direccion: params.direccion,
    localidad: params.localidad || params.ciudad,
    provincia: params.provincia,
    codigoPostal: params.codigoPostal,
    pais: basePais,
  });
  const q3 = [
    params.direccion,
    `${params.codigoPostal || ""} ${params.ciudad || params.localidad || ""}`,
    basePais,
  ]
    .filter(Boolean)
    .join(", ");
  const q4 = [params.ciudad || params.localidad, params.provincia, basePais]
    .filter(Boolean)
    .join(", ");

  const queries = [q1, q2, q3, q4].filter(Boolean);

  for (const q of queries) {
    if (cache.has(q)) return cache.get(q);

    try {
      logger.info(`🌍 Geocoding: "${q}"`);
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
        }
      );

      const first = Array.isArray(data) && data.find(Boolean);
      const result = first
        ? { lat: parseFloat(first.lat), lon: parseFloat(first.lon) }
        : null;

      cache.set(q, result);
      if (result) {
        logger.info(`✅ Geocoding OK: ${result.lat}, ${result.lon}`);
        return result;
      } else {
        logger.warn(`⚠️ Geocoding sin resultados para: "${q}"`);
      }
    } catch (err) {
      logger.error(`❌ Error geocoding "${q}": %o`, err?.message || err);
    }
  }

  return null;
}

module.exports = { geocodeAddress };
