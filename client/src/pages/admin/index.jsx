import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import AdminLayout from "./AdminLayout";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Appointments from "./Appointments";
import Customers from "./Customers";
import Services from "./Services";
import Barbers from "./Barbers";
import Gallery from "./Gallery";
import Reviews from "./Reviews";
import Messages from "./Messages";
import Settings from "./Settings";
import Profile from "./Profile";
import ClosedDays from "./ClosedDays";
import WorkingHours from "./WorkingHours";
import { Spinner } from "./ui";

function Gate() {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <div className="login-screen">
        <Spinner label="Vérification de la session…" />
      </div>
    );
  }
  if (status === "guest") return <Login />;
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rendez-vous" element={<Appointments />} />
        <Route path="clients" element={<Customers />} />
        <Route path="services" element={<Services />} />
        <Route path="barbiers" element={<Barbers />} />
        <Route path="galerie" element={<Gallery />} />
        <Route path="temoignages" element={<Reviews />} />
        <Route path="jours-fermes" element={<ClosedDays />} />
        <Route path="horaires" element={<WorkingHours />} />
        <Route path="messages" element={<Messages />} />
        <Route path="parametres" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function Admin() {
  return (
    <div className="admin-root">
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </div>
  );
}