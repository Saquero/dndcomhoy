module.exports = (req, res, next) => {
  const {
    nombre,
    direccion,
    descripcion,
    telefonoRestaurante,
    emailRestaurante,
    imagenes,
    estado,
  } = req.body;

  // Campos obligatorios
  if (!nombre?.trim()) {
    return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
  }
  if (!direccion?.trim()) {
    return res
      .status(400)
      .json({ error: "El campo 'direccion' es obligatorio" });
  }
  if (!descripcion?.trim()) {
    return res
      .status(400)
      .json({ error: "El campo 'descripcion' es obligatorio" });
  }

  // Validación de strings opcionales
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

  // Validar que 'imagenes' sea array de strings si viene
  if (imagenes) {
    if (!Array.isArray(imagenes)) {
      return res
        .status(400)
        .json({ error: "El campo 'imagenes' debe ser un arreglo de strings" });
    }

    const noSonStrings = imagenes.some((img) => typeof img !== "string");
    if (noSonStrings) {
      return res
        .status(400)
        .json({ error: "Todas las imágenes deben ser strings" });
    }
  }

  // Validar 'estado' como string si viene
  if (estado && typeof estado !== "string") {
    return res.status(400).json({ error: "El campo 'estado' debe ser string" });
  }

  // Validar booleanos opcionales (misma lista que en restaurante)
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
