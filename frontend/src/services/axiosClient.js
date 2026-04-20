import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

let csrfToken = null;

export async function initCsrf() {
  const { data } = await api.get("/csrf-token");
  csrfToken = data.csrfToken;
  return csrfToken;
}

api.interceptors.request.use((config) => {
  if (csrfToken && !["get", "head", "options"].includes(config.method?.toLowerCase())) {
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === "invalid csrf token" &&
      !original._csrfRetried
    ) {
      original._csrfRetried = true;
      try {
        await initCsrf();
        original.headers["x-csrf-token"] = csrfToken;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
