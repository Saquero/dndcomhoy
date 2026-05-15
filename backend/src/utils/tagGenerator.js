function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function generateTags(input = "") {
  const text = normalizeText(input);
  const tags = new Set();

  const rules = [
    {
      tag: "familiar",
      keywords: [
        "familiar",
        "familias",
        "familia",
        "ninos",
        "peques",
        "infantil",
        "padres",
        "cumpleanos",
      ],
    },
    {
      tag: "ninos",
      keywords: [
        "ninos",
        "peques",
        "infantil",
        "menores",
        "hijos",
      ],
    },
    {
      tag: "padres tranquilos",
      keywords: [
        "padres puedan",
        "padres pueden",
        "padres descansan",
        "padres tranquilos",
        "tomar algo mientras",
        "comer tranquilos",
        "mientras los ninos",
        "mientras los peques",
      ],
    },
    {
      tag: "zona infantil",
      keywords: [
        "zona infantil",
        "area infantil",
        "espacio infantil",
        "zona de juego",
        "zona de juegos",
        "juegos infantiles",
      ],
    },
    {
      tag: "parque",
      keywords: [
        "parque",
        "parque infantil",
        "zona de juegos",
        "juegos infantiles",
        "zona exterior de juego",
      ],
    },
    {
      tag: "parque de bolas",
      keywords: [
        "parque de bolas",
        "bolas",
        "pelotero",
      ],
    },
    {
      tag: "ludoteca",
      keywords: [
        "ludoteca",
        "monitores",
        "monitor",
        "supervisados",
        "supervisadas",
        "talleres",
      ],
    },
    {
      tag: "cumpleanos",
      keywords: [
        "cumpleanos",
        "cumple",
        "celebrar cumpleanos",
        "fiestas infantiles",
        "celebraciones infantiles",
      ],
    },
    {
      tag: "hinchables",
      keywords: [
        "hinchable",
        "hinchables",
        "castillo hinchable",
        "castillos hinchables",
      ],
    },
    {
      tag: "trampolines",
      keywords: [
        "trampolin",
        "trampolines",
        "camas elasticas",
      ],
    },
    {
      tag: "toboganes",
      keywords: [
        "tobogan",
        "toboganes",
      ],
    },
    {
      tag: "cafeteria",
      keywords: [
        "cafeteria",
        "cafe",
        "tomar cafe",
        "cafes",
      ],
    },
    {
      tag: "merienda",
      keywords: [
        "merienda",
        "merendar",
        "tartas",
        "helados",
        "snacks",
        "smoothies",
      ],
    },
    {
      tag: "menu infantil",
      keywords: [
        "menu infantil",
        "menus infantiles",
        "menu para ninos",
        "menus para pequenos",
        "menu ninos",
      ],
    },
    {
      tag: "terraza",
      keywords: [
        "terraza",
        "exterior",
        "aire libre",
        "zona exterior",
        "jardin",
        "jardines",
      ],
    },
    {
      tag: "playa",
      keywords: [
        "playa",
        "beach",
        "costa",
        "frente a la playa",
      ],
    },
    {
      tag: "piscina",
      keywords: [
        "piscina",
      ],
    },
    {
      tag: "paella",
      keywords: [
        "paella",
        "arroces",
        "arroz",
        "caldero",
      ],
    },
    {
      tag: "mediterraneo",
      keywords: [
        "mediterranea",
        "mediterraneo",
        "cocina mediterranea",
      ],
    },
    {
      tag: "hamburguesa",
      keywords: [
        "hamburguesa",
        "hamburguesas",
        "burger",
        "burgers",
      ],
    },
    {
      tag: "italiano",
      keywords: [
        "italiano",
        "italiana",
        "pizza",
        "pasta",
        "buffet italiano",
      ],
    },
    {
      tag: "buffet",
      keywords: [
        "buffet",
        "bebidas ilimitadas",
      ],
    },
    {
      tag: "marisco",
      keywords: [
        "marisco",
        "pescado",
        "pescados",
        "caldero",
      ],
    },
    {
      tag: "brasa",
      keywords: [
        "brasa",
        "brasas",
        "asador",
        "carne a la brasa",
        "carnes",
      ],
    },
    {
      tag: "vegano",
      keywords: [
        "vegano",
        "veganas",
        "veganos",
      ],
    },
    {
      tag: "vegetariano",
      keywords: [
        "vegetariano",
        "vegetariana",
        "vegetarianas",
        "vegetarianos",
      ],
    },
    {
      tag: "carrito",
      keywords: [
        "carrito",
        "accesible con carrito",
        "sitio para carrito",
      ],
    },
    {
      tag: "bebes",
      keywords: [
        "bebe",
        "bebes",
        "trona",
        "cambiador",
      ],
    },
    {
      tag: "parking",
      keywords: [
        "parking",
        "aparcamiento",
      ],
    },
    {
      tag: "ocio infantil",
      keywords: [
        "ocio infantil",
        "animacion infantil",
        "animaciones",
        "actividades",
        "diversion",
        "jugar",
        "juegan",
        "se divierten",
      ],
    },
  ];

  for (const rule of rules) {
    if (includesAny(text, rule.keywords)) {
      tags.add(rule.tag);
    }
  }

  if (
    includesAny(text, ["parque de bolas", "ludoteca", "hinchable", "trampolin", "tobogan", "monitores"]) &&
    includesAny(text, ["cafeteria", "bar", "restaurante", "comer", "tomar algo", "merendar"])
  ) {
    tags.add("comer mientras juegan");
    tags.add("padres tranquilos");
  }

  if (
    includesAny(text, ["cumpleanos", "cumple", "celebraciones infantiles"]) &&
    includesAny(text, ["menu", "cafeteria", "restaurante", "bar", "merienda"])
  ) {
    tags.add("cumpleanos infantiles");
  }

  if (
    includesAny(text, ["terraza", "jardin", "aire libre", "zona exterior"]) &&
    includesAny(text, ["ninos", "peques", "infantil", "familiar"])
  ) {
    tags.add("terraza con ninos");
  }

  return Array.from(tags).slice(0, 20);
}

module.exports = {
  generateTags,
};
