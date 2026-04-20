import api from "./axiosClient";

export const user = {
  async getOwner() {
    const { data } = await api.get("/users/owner");
    return data;
  },
  async getAll() {
    const { data } = await api.get("/users");
    return data;
  },
  async getOne(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
};
