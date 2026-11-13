export const business = {
  name: "ER RAMMACH Mohamed Barber Shop",
  phone: "0623444465",
  phoneDisplay: "06 23 44 44 65",
  internationalPhone: "+212623444465",
  instagram: "Mohamed Er rammach",
  instagramHandle: "mohamed_errammach",
  address: "123, Rue des Coiffeurs",
  city: "Meknès, Maroc",
  openingHours: "Lun - Sam : 09:00 - 20:00",
  timezone: "Africa/Casablanca",
};

export function toInternationalPhone(phone) {
  let d = String(phone || "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("00")) return "+" + d.slice(2).replace(/[^\d]/g, "");
  if (d.startsWith("0")) return "+212" + d.slice(1).replace(/[^\d]/g, "");
  return "+" + d.replace(/[^\d]/g, "");
}

export function whatsAppUrlFor(internationalPhone) {
  return `https://wa.me/${internationalPhone.replace("+", "")}?text=${encodeURIComponent(
    "Bonjour Mohamed, je souhaite prendre rendez-vous chez ER RAMMACH Barber Shop.",
  )}`;
}

export function instagramUrlFor(handle) {
  return `https://www.instagram.com/${handle}/`;
}

export const whatsappUrl = whatsAppUrlFor(business.internationalPhone);
export const instagramUrl = instagramUrlFor(business.instagramHandle);