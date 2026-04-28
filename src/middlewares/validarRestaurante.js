module.exports = (req, res, next) => {
  const {
    nombre,
    direccion,
    ciudad,
    provincia,
    descripcion,
    telefonoRestaurante,
    emailRestaurante,
    imagenes,
    zonaAmplia,
    parqueCercano,
    zonaInfantil,
    menuInfantil,
    tronaDisponible,
    cambiadorDisponible,
    sitioParaCarrito,
    terrazaSegura,
    ambienteFamiliar,
    sinPantallas,
    aptoVegetariano,
    aptoVegano,
    actividadesParaNinos,
    accesibleConCarrito,
    activo,
    verificado,
  } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
  }
  if (!direccion) {
    return res
      .status(400)
      .json({ error: "El campo 'direccion' es obligatorio" });
  }
  if (!ciudad) {
    return res.status(400).json({ error: "El campo 'ciudad' es obligatorio" });
  }
  if (!provincia) {
    return res
      .status(400)
      .json({ error: "El campo 'provincia' es obligatorio" });
  }
  if (!descripcion) {
    return res
      .status(400)
      .json({ error: "El campo 'descripcion' es obligatorio" });
  }
  if (telefonoRestaurante && typeof telefonoRestaurante !== "string") {
    return res
      .status(400)
      .json({ error: "El campo 'telefonoRestaurante' debe ser string" });
  }
  if (emailRestaurante && typeof emailRestaurante !== "string") {
    return res
      .status(400)
      .json({ error: "El campo 'emailRestaurante' debe ser string" });
  }
  if (imagenes && !Array.isArray(imagenes)) {
    return res
      .status(400)
      .json({ error: "El campo 'imagenes' debe ser un arreglo de strings" });
  }

  // Validar booleanos si vienen, que sean booleanos o strings "true"/"false"
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

  for (const field of booleanFields) {
    if (
      req.body[field] !== undefined &&
      typeof req.body[field] !== "boolean" &&
      req.body[field] !== "true" &&
      req.body[field] !== "false"
    ) {
      return res.status(400).json({
        error: `El campo '${field}' debe ser booleano o 'true'/'false' como string`,
      });
    }
  }

  next();
};
