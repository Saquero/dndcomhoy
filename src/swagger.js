const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API - Dónde Comemos Hoy",
      version: "1.0.0",
      description:
        "Documentación de la API para sugerencias, restaurantes y admins.",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SugerenciaInput: {
          type: "object",
          properties: {
            nombre: {
              type: "string",
              description: "Inserta aquí el nombre del restaurante",
              example: "Restaurante La Buena Mesa",
            },
            direccion: {
              type: "string",
              description: "Dirección completa del restaurante",
              example: "Calle Falsa 123",
            },
            descripcion: {
              type: "string",
              description: "Descripción breve y atractiva del restaurante",
              example: "Un lugar acogedor y perfecto para familias con niños.",
            },
            localidad: {
              type: "string",
              description: "Localidad donde se encuentra el restaurante",
              example: "Torrevieja",
            },
            ciudad: {
              type: "string",
              description: "Ciudad del restaurante",
              example: "Alicante",
            },
            provincia: {
              type: "string",
              description: "Provincia del restaurante",
              example: "Alicante",
            },
            nombreContacto: {
              type: "string",
              description: "Nombre de la persona que sugiere el restaurante",
              example: "Manuel Saquero",
            },
            emailContacto: {
              type: "string",
              format: "email",
              description: "Email de contacto de quien sugiere (opcional)",
              example: "manuel@example.com",
            },
            comentarios: {
              type: "string",
              description:
                "Comentarios adicionales sobre el restaurante (opcional)",
              example: "Tiene zona infantil y tronas disponibles.",
            },

            zonaAmplia: {
              type: "boolean",
              description:
                "Indica si el restaurante tiene una zona amplia para familias. True = Sí, False = No.",
              example: true,
            },
            parqueCercano: {
              type: "boolean",
              description:
                "¿Hay un parque cercano para que los niños puedan jugar? True = Sí, False = No.",
              example: false,
            },
            zonaInfantil: {
              type: "boolean",
              description:
                "¿El restaurante dispone de zona infantil? True = Sí, False = No.",
              example: true,
            },
            tronaDisponible: {
              type: "boolean",
              description:
                "¿Hay tronas para bebés disponibles? True = Sí, False = No.",
              example: true,
            },
            cambiadorDisponible: {
              type: "boolean",
              description:
                "¿Dispone de cambiador para bebés? True = Sí, False = No.",
              example: false,
            },
            sitioParaCarrito: {
              type: "boolean",
              description:
                "¿Hay espacio para dejar el carrito de bebé? True = Sí, False = No.",
              example: true,
            },
            terrazaSegura: {
              type: "boolean",
              description:
                "¿La terraza es segura para los niños? True = Sí, False = No.",
              example: false,
            },
            actividadesParaNinos: {
              type: "boolean",
              description:
                "¿Se ofrecen actividades para niños? True = Sí, False = No.",
              example: true,
            },
            menuInfantil: {
              type: "boolean",
              description:
                "¿El restaurante ofrece menú infantil? True = Sí, False = No.",
              example: true,
            },
            aptoVegetariano: {
              type: "boolean",
              description:
                "¿Tiene opciones vegetarianas? True = Sí, False = No.",
              example: true,
            },
            aptoVegano: {
              type: "boolean",
              description: "¿Tiene opciones veganas? True = Sí, False = No.",
              example: false,
            },
            sinPantallas: {
              type: "boolean",
              description:
                "¿El restaurante no usa pantallas para distraer? True = Sí, False = No.",
              example: true,
            },
            ambienteFamiliar: {
              type: "boolean",
              description:
                "¿El ambiente es familiar y tranquilo? True = Sí, False = No.",
              example: true,
            },
            accesibleConCarrito: {
              type: "boolean",
              description:
                "¿Es accesible con carrito de bebé? True = Sí, False = No.",
              example: true,
            },
          },
          required: [
            "nombre",
            "direccion",
            "descripcion",
            "localidad",
            "ciudad",
            "provincia",
            "nombreContacto",
          ],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [__dirname + "/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
