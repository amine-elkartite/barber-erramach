import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const data = await api("/admin/upload", { method: "POST", body: fd });
  return data.url;
}

export function useAdminData(path, { method = "GET", body } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let aborted = false;
    setLoading(true);
    setError(null);
    const options = { signal: controller.signal };
    if (method !== "GET") {
      options.method = method;
      options.body = body ? JSON.stringify(body) : undefined;
    }
    api(path, options)
      .then((d) => {
        if (!aborted) setData(d);
      })
      .catch((e) => {
        if (!aborted && e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [path, method, body, version]);

  return { data, loading, error, reload };
}

export function useCrud(basePath, { keyProp = "id" } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api(basePath, { signal: controller.signal })
      .then((d) => setItems(Array.isArray(d) ? d : d.items || []))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [basePath, version]);

  const create = useCallback(
    async (body) => {
      const created = await api(basePath, { method: "POST", body: JSON.stringify(body) });
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [basePath],
  );

  const update = useCallback(
    async (id, body) => {
      const updated = await api(`${basePath}/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      setItems((prev) => prev.map((item) => (item[keyProp] == id ? updated : item)));
      return updated;
    },
    [basePath, keyProp],
  );

  const remove = useCallback(
    async (id) => {
      await api(`${basePath}/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item[keyProp] != id));
    },
    [basePath, keyProp],
  );

  const toggle = useCallback(
    async (id, field, value) => {
      const updated = await api(`${basePath}/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });
      setItems((prev) => prev.map((item) => (item[keyProp] == id ? { ...item, ...updated } : item)));
      return updated;
    },
    [basePath, keyProp],
  );

  return { items, setItems, loading, error, reload, create, update, remove, toggle };
}