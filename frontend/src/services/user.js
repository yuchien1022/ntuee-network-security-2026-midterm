import api from "./axiosClient";

export const user = {
  async getAll() {
    const { data } = await api.get("/users");
    return data;
  },
  async getOne(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
};
