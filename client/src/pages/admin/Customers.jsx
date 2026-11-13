import { Download, Mail, Phone } from "lucide-react";
import { useAdminData } from "./data";
import {
  AdminButton,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Spinner,
  Toolbar,
  formatDate,
  useSearch,
} from "./ui";

function exportCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Customers() {
  const { data, loading, error, reload } = useAdminData("/admin/customers");
  const items = Array.isArray(data) ? data : data?.items || [];
  const { query, setQuery, filtered } = useSearch(items, ["name", "phone", "email"]);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Liste dérivée des rendez-vous enregistrés."
        actions={<AdminButton variant="outline" icon={Download} onClick={() => exportCsv("clients.csv", filtered.map((c) => [c.name, c.phone, c.email, c.total_appointments, c.last_appointment]))}>Exporter CSV</AdminButton>}
      />
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un nom, téléphone ou e-mail…">
        <AdminButton variant="outline" onClick={reload}>Actualiser</AdminButton>
      </Toolbar>

      {loading ? (
        <Spinner label="Chargement des clients…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun client" message="Les clients apparaîtront après les premières réservations." />
      ) : (
        <div className="panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>E-mail</th>
                  <th>Rendez-vous</th>
                  <th>Dernière visite</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={`${c.phone}-${i}`}>
                    <td>
                      <div className="cell-main">
                        <span className="cell-avatar">{String(c.name || "?").charAt(0)}</span>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{c.total_appointments}</td>
                    <td>{formatDate(c.last_appointment)}</td>
                    <td className="actions-col">
                      <IconButton label="Appeler" icon={Phone} onClick={() => { window.location.href = `tel:${c.phone}`; }} />
                      {c.email && (
                        <IconButton label="Écrire" icon={Mail} onClick={() => { window.location.href = `mailto:${c.email}`; }} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="table-footer"><span>{filtered.length} clients</span></footer>
        </div>
      )}
    </>
  );
}