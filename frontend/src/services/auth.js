import api, { initCsrf } from "./axiosClient";

export const auth = {
  async register({ username, email, password }) {
    const { data } = await api.post("/auth/register", { username, email, password });
    await initCsrf();
    return data;
  },
  async login({ username, password }) {
    const { data } = await api.post("/auth/login", { username, password });
    await initCsrf();
    return data;
  },
  async logout() {
    const { data } = await api.post("/auth/logout");
    return data;
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data.user;
  },
  async uploadAvatar(file) {
    const form = new FormData();
    form.append("avatar", file);
    const { data } = await api.post("/upload/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
