import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import {
  business as staticBusiness,
  toInternationalPhone,
  whatsAppUrlFor,
  instagramUrlFor,
} from "../config/business";

const SettingsContext = createContext(null);

function buildFromSettings(settings) {
  const b = { ...staticBusiness };
  const overrides = {
    business_name: "name",
    business_phone: "phone",
    business_phone_display: "phoneDisplay",
    business_email: "email",
    business_address: "address",
    business_city: "city",
    business_opening_hours: "openingHours",
    business_instagram_handle: "instagramHandle",
    business_instagram_label: "instagram",
  };
  for (const [key, field] of Object.entries(overrides)) {
    if (settings[key]) b[field] = settings[key];
  }
  b.internationalPhone = toInternationalPhone(b.phone);
  return b;
}

export function SettingsProvider({ children }) {
  const [state, setState] = useState({
    settings: {},
    business: staticBusiness,
    whatsappUrl: whatsAppUrlFor(staticBusiness.internationalPhone),
    instagramUrl: instagramUrlFor(staticBusiness.instagramHandle),
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async function load() {
      let next;
      try {
        const data = await api("/settings");
        next = data || {};
      } catch {
        next = {};
      }
      if (cancelled) return;
      const business = buildFromSettings(next);
      setState({
        settings: next,
        business,
        whatsappUrl: whatsAppUrlFor(business.internationalPhone),
        instagramUrl: instagramUrlFor(business.instagramHandle),
        ready: true,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <SettingsContext.Provider value={state}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}