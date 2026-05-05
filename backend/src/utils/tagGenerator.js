function generateTags(text = "") {
  const t = text.toLowerCase();

  const dictionary = {
    marisco: ["marisco", "pescado", "seafood"],
    paella: ["paella", "arroz", "arroces"],
    italiano: ["pizza", "italiano", "pasta"],
    hamburguesa: ["burger", "hamburguesa"],
    familiar: ["familia", "familiar", "niños"],
    terraza: ["terraza", "exterior"],
    parque: ["parque", "zona verde"],
    infantil: ["niños", "juegos"],
    vegetariano: ["vegano", "vegetariano"]
  };

  const tags = new Set();

  for (const [tag, words] of Object.entries(dictionary)) {
    for (const w of words) {
      if (t.includes(w)) {
        tags.add(tag);
        break;
      }
    }
  }

  return Array.from(tags);
}

module.exports = { generateTags };
