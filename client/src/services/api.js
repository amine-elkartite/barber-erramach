import { useEffect, useState } from "react";
const base = import.meta.env.VITE_API_URL || "/api";
export async function api(path, options = {}) {
  let response;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = isFormData
    ? { ...options.headers }
    : { "Content-Type": "application/json", ...options.headers };
  try {
    response = await fetch(base + path, {
      credentials: "include",
      ...options,
      headers,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Connexion impossible. Vérifiez votre connexion et réessayez.");
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Le service est momentanément indisponible.");
  }
  if (!response.ok || !result.success) {
    const error = new Error(result.message || "Une erreur est survenue.");
    error.status = response.status;
    throw error;
  }
  return result.data;
}
export async function apiRaw(path, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(base + path, {
    credentials: "include",
    ...options,
    headers: isFormData ? { ...options.headers } : { "Content-Type": "application/json", ...options.headers },
  });
  return response;
}
export function useApi(path) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ data: null, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [path, version]);
  return { ...state, retry: () => setVersion((v) => v + 1) };
}
