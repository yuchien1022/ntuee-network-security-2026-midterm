import api from "./axiosClient";

export const message = {
  async getAll() {
    const { data } = await api.get("/messages");
    return data;
  },
  async create({ content }) {
    const { data } = await api.post("/messages", { content });
    return data;
  },
  async update(id, content) {
    const { data } = await api.patch(`/messages/${id}`, { content });
    return data;
  },
  async remove(id) {
    await api.delete(`/messages/${id}`);
  },
};
