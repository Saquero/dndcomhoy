module.exports = (req, res, next) => {
  const {
    nombre,
    direccion,
    localidad,
    ciudad,
    provincia,
    codigoPostal,
    pais,
    descripcion,
    telefonoRestaurante,
    emailRestaurante,
    imagenes,
    estado,
    latitud,
    longitud,
  } = req.body;

  if (!nombre?.trim())
    return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
  if (!direccion?.trim())
    return res
      .status(400)
      .json({ error: "El campo 'direccion' es obligatorio" });
  if (!localidad?.trim())
    return res
      .status(400)
      .json({ error: "El campo 'localidad' es obligatorio" });
  if (!ciudad?.trim())
    return res.status(400).json({ error: "El campo 'ciudad' es obligatorio" });
  if (!provincia?.trim())
    return res
      .status(400)
      .json({ error: "El campo 'provincia' es obligatorio" });
  if (!descripcion?.trim())
    return res
      .status(400)
      .json({ error: "El campo 'descripcion' es obligatorio" });

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
  if (imagenes) {
    if (!Array.isArray(imagenes))
      return res
        .status(400)
        .json({ error: "El campo 'imagenes' debe ser un arreglo de strings" });
    if (imagenes.some((img) => typeof img !== "string"))
      return res
        .status(400)
        .json({ error: "Todas las imágenes deben ser strings" });
  }
  if (estado && typeof estado !== "string") {
    return res.status(400).json({ error: "El campo 'estado' debe ser string" });
  }

  if (latitud !== undefined && typeof latitud !== "number") {
    return res
      .status(400)
      .json({ error: "El campo 'latitud' debe ser número" });
  }
  if (longitud !== undefined && typeof longitud !== "number") {
    return res
      .status(400)
      .json({ error: "El campo 'longitud' debe ser número" });
  }

  // normaliza país por defecto si no viene
  if (!pais) req.body.pais = "España";

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
      return res
        .status(400)
        .json({
          error: `El campo '${field}' debe ser booleano o 'true'/'false'`,
        });
    }
  }

  next();
};
