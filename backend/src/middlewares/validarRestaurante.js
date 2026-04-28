module.exports = (req, res, next) => {
  const b = req.body || {};

  // Requeridos SOLO en POST (crear)
  if (req.method === "POST") {
    const obligatorios = [
      "nombre",
      "direccion",
      "localidad",
      "ciudad",
      "provincia",
      "descripcion",
    ];
    for (const f of obligatorios) {
      if (!b[f] || String(b[f]).trim() === "") {
        return res
          .status(400)
          .json({ error: `El campo '${f}' es obligatorio` });
      }
    }
  }

  // Tipos simples
  if (b.telefonoRestaurante && typeof b.telefonoRestaurante !== "string") {
    return res
      .status(400)
      .json({ error: "El campo 'telefonoRestaurante' debe ser string" });
  }
  if (b.emailRestaurante && typeof b.emailRestaurante !== "string") {
    return res
      .status(400)
      .json({ error: "El campo 'emailRestaurante' debe ser string" });
  }

  // Imágenes: si viene, debe ser array
  if (b.imagenes !== undefined && !Array.isArray(b.imagenes)) {
    return res
      .status(400)
      .json({ error: "El campo 'imagenes' debe ser un arreglo de strings" });
  }

  // Coordenadas opcionales: solo valida si traen valor
  const checkNum = (v, field) => {
    if (v === undefined || v === null || v === "") return;
    const n = Number(v);
    if (!Number.isFinite(n)) {
      return res
        .status(400)
        .json({ error: `El campo '${field}' debe ser número` });
    }
  };
  const e1 = checkNum(b.latitud, "latitud");
  if (e1) return e1;
  const e2 = checkNum(b.longitud, "longitud");
  if (e2) return e2;

  // Flags booleanas (acepta boolean o "true"/"false" y las normaliza)
  const booleanFields = [
    "zonaAmplia",
    "parqueCercano",
    "zonaInfantil",
    "menuInfantil",
    "tronaDisponible",
    "cambiadorDisponible",
    "sitioParaCarrito",
    "terrazaSegura",
    "ambienteFamiliar",
    "sinPantallas",
    "aptoVegetariano",
    "aptoVegano",
    "actividadesParaNinos",
    "accesibleConCarrito",
    "activo",
    "verificado",
  ];
  for (const f of booleanFields) {
    if (b[f] === "true") b[f] = true;
    if (b[f] === "false") b[f] = false;
    if (b[f] !== undefined && typeof b[f] !== "boolean") {
      return res
        .status(400)
        .json({ error: `El campo '${f}' debe ser booleano` });
    }
  }

  // País por defecto
  if (!b.pais) req.body.pais = "España";

  next();
};
