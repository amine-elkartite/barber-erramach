import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("loading");

  const check = useCallback(async () => {
    try {
      const data = await api("/admin/me");
      setAdmin(data);
      setStatus("authed");
    } catch {
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const login = useCallback(async (email, password) => {
    const data = await api("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAdmin(data.admin);
    setStatus("authed");
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/admin/logout", { method: "POST" });
    } catch {
      // session already expired
    }
    setAdmin(null);
    setStatus("guest");
  }, []);

  return (
    <AuthContext.Provider value={{ admin, status, login, logout, reload: check }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return value;
}