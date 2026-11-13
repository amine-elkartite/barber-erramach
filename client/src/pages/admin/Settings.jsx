import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { api } from "../../services/api";
import { ErrorState, Field, PageHeader, Spinner, Toast, useToast } from "./ui";

const SECTIONS = [
  {
    key: "business",
    title: "Informations du salon",
    fields: [
      ["business_name", "Nom de l’établissement"],
      ["business_phone", "Téléphone (06 …)"],
      ["business_phone_display", "Téléphone affiché (06 23 44 44 65)"],
      ["business_email", "Email"],
      ["business_address", "Adresse"],
      ["business_city", "Ville"],
      ["business_opening_hours", "Horaires (Lun - Sam : …)"],
      ["business_opening_hours_sunday", "Horaires du dimanche"],
    ],
  },
  {
    key: "socials",
    title: "Réseaux sociaux",
    fields: [
      ["business_whatsapp", "WhatsApp (+212…)"],
      ["business_instagram_handle", "Nom d’utilisateur Instagram"],
      ["business_instagram_label", "Libellé Instagram"],
      ["business_facebook_url", "Facebook (URL complète)"],
    ],
  },
  {
    key: "hero",
    title: "Accueil (bandeau)",
    fields: [
      ["hero_title", "Titre principal"],
      ["hero_subtitle_top", "Sous-titre (haut)"],
      ["hero_subtitle_bottom", "Sous-titre (bas)"],
      ["hero_slogan", "Slogan"],
      ["home_services_title", "Titre de la section services"],
    ],
  },
  {
    key: "heroText",
    title: "Description d’accueil",
    textareas: [["hero_description", "Description d’accueil"]],
  },
  {
    key: "about",
    title: "Page À propos",
    textareas: [["about_text", "Texte de présentation"]],
    jsonList: [["about_values", "Valeurs (une par ligne)"]],
    fields: [
      ["about_stats_years", "Statistique — Années"],
      ["about_stats_clients", "Statistique — Clients"],
      ["about_stats_services", "Statistique — Services"],
    ],
  },
  {
    key: "footer",
    title: "Pied de page",
    fields: [["footer_copyright", "Texte de copyright"]],
  },
];

function SectionForm({ settings, onChange }) {
  return (
    <div className="form-grid two">
      {SECTIONS.map((section) => (
        <div className="section-form field-span" key={section.key}>
          <h4>{section.title}</h4>
          <div className="form-grid two">
            {section.fields?.map(([key, label]) => (
              <Field key={key} label={label}>
                <input value={settings[key] ?? ""} onChange={(e) => onChange(key, e.target.value)} />
              </Field>
            ))}
            {section.textareas?.map(([key, label]) => (
              <div className="field-span" key={key}>
                <Field label={label}>
                  <textarea value={settings[key] ?? ""} onChange={(e) => onChange(key, e.target.value)} rows="4" />
                </Field>
              </div>
            ))}
            {section.jsonList?.map(([key, label]) => (
              <div className="field-span" key={key}>
                <Field label={label}>
                  <textarea
                    value={Array.isArray(settings[key]) ? settings[key].join("\n") : settings[key] ?? ""}
                    onChange={(e) => onChange(key, e.target.value.split("\n").filter((l) => l.trim()))}
                    rows="4"
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Settings() {
  const [loaded, setLoaded] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast, notify, dismiss } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/admin/settings");
      setLoaded(data);
      setForm(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const changed = {};
      for (const key of Object.keys(form)) {
        if (JSON.stringify(form[key]) !== JSON.stringify(loaded?.[key])) changed[key] = form[key];
      }
      if (Object.keys(changed).length) {
        await api("/admin/settings", { method: "PATCH", body: JSON.stringify(changed) });
        setLoaded(form);
        notify("Paramètres enregistrés.");
      } else {
        notify("Aucune modification.");
      }
    } catch (e) {
      setError(e.message);
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (!loaded) return false;
    return Object.keys(form).some((k) => JSON.stringify(form[k]) !== JSON.stringify(loaded[k]));
  }, [form, loaded]);

  return (
    <>
      <PageHeader
        title="Paramètres"
        subtitle="Contenu affiché sur le site public."
        actions={
          <button className="button button-primary" onClick={save} disabled={saving || !hasChanges}>
            {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        }
      />

      {loading ? (
        <Spinner label="Chargement des paramètres…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="panel settings-panel">
          <SectionForm settings={form} onChange={setField} />
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}
    </>
  );
}