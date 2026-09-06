export const serviceCategories = [
  ["coupe_moderne", "COUPE MODERNE", "حلاقة عصرية"],
  ["coupe_classique", "COUPE CLASSIQUE", "حلاقة عادية"],
  ["soins_beaute", "SOINS & BEAUTÉ", "التجميل"],
].map(([id, label, arabicLabel]) => ({ id, label, arabicLabel }));
export function formatServicePrice(service) {
  const price = Number(service?.price || 0);
  const amount = Number.isInteger(price) ? price : price.toFixed(2);
  return service?.price_type === "starting_from"
    ? `À partir de ${amount} DH`
    : `${amount} DH`;
}
export const startingPriceNote =
  "Le prix final peut varier selon la longueur, le type et les besoins de vos cheveux.";
export const services = [
  [
    "Dégradé cheveux",
    "coupe_moderne",
    25,
    "fixed",
    30,
    "Dégradé moderne, fondu net et finition soignée.",
  ],
  [
    "Dégradé barbe",
    "coupe_moderne",
    15,
    "fixed",
    20,
    "Barbe structurée avec contours propres et symétriques.",
  ],
  [
    "Dégradé enfant",
    "coupe_moderne",
    20,
    "fixed",
    30,
    "Coupe moderne adaptée aux enfants, rapide et confortable.",
  ],
  [
    "Sèche-cheveux",
    "coupe_moderne",
    10,
    "fixed",
    15,
    "Mise en forme au sèche-cheveux pour une finition élégante.",
  ],
  [
    "Lavage cheveux",
    "coupe_moderne",
    10,
    "fixed",
    15,
    "Lavage frais et propre avant ou après la coupe.",
  ],
  [
    "Coupe cheveux",
    "coupe_classique",
    20,
    "fixed",
    30,
    "Coupe classique précise pour un style propre au quotidien.",
  ],
  [
    "Rasage visage",
    "coupe_classique",
    10,
    "fixed",
    20,
    "Rasage net du visage avec une finition douce.",
  ],
  [
    "Coupe enfant classique",
    "coupe_classique",
    15,
    "fixed",
    25,
    "Coupe enfant simple, propre et confortable.",
  ],
  [
    "Contours cheveux + barbe",
    "coupe_classique",
    15,
    "fixed",
    20,
    "Contours précis pour cheveux et barbe.",
  ],
  [
    "Protéine",
    "soins_beaute",
    200,
    "starting_from",
    60,
    "Soin protéiné pour renforcer, lisser et raviver les cheveux.",
  ],
  [
    "Kératine",
    "soins_beaute",
    150,
    "starting_from",
    60,
    "Soin à la kératine pour discipline, brillance et douceur.",
  ],
  [
    "Hydratation (Dark)",
    "soins_beaute",
    60,
    "fixed",
    30,
    "Hydratation ciblée pour nourrir les cheveux en profondeur.",
  ],
  [
    "Nettoyage du visage à la vapeur",
    "soins_beaute",
    80,
    "fixed",
    45,
    "Nettoyage vapeur pour purifier et détendre la peau.",
  ],
  [
    "Nettoyage du visage (Gommage)",
    "soins_beaute",
    20,
    "fixed",
    25,
    "Gommage du visage pour une peau plus nette.",
  ],
  [
    "Masque noir",
    "soins_beaute",
    10,
    "fixed",
    20,
    "Masque noir pour nettoyer les pores et rafraîchir le visage.",
  ],
  [
    "Coloration cheveux",
    "soins_beaute",
    70,
    "starting_from",
    60,
    "Coloration personnalisée selon votre style et vos cheveux.",
  ],
].map(([name, category, price, price_type, duration, description], i) => ({
  id: i + 1,
  name,
  category,
  price,
  price_type,
  duration,
  description,
  image: `/images/service-${((i % 11) + 1).toString()}.webp`,
  active: true,
}));
export const barbers = ["Mohamed Er Rammach", "Yassine", "Karim"].map(
  (name, i) => ({
    id: i + 1,
    name,
    role: i === 0 ? "Fondateur" : "Barbier",
    image: `/images/barber-${i + 1}.webp`,
  }),
);
export const gallery = [
  "Coupes",
  "Soins",
  "Salon",
  "Barbes",
  "Coupes",
  "Soins",
  "Barbes",
  "Salon",
  "Coupes",
].map((category, i) => ({
  id: i + 1,
  title: {
    Coupes: "Une coupe, votre signature",
    Soins: "Un moment pour soi",
    Salon: "Bienvenue dans notre univers",
    Barbes: "Le souci du détail",
  }[category],
  category,
  image: `/images/gallery-${i + 1}.webp`,
}));
