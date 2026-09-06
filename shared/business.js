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
export const whatsappUrl = `https://wa.me/${business.internationalPhone.replace("+", "")}?text=${encodeURIComponent("Bonjour Mohamed, je souhaite prendre rendez-vous chez ER RAMMACH Barber Shop.")}`;
export const instagramUrl = `https://www.instagram.com/${business.instagramHandle}/`;
