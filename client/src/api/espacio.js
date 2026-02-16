import axios from "./axios";
export const getEspaciosRequest = () => axios.get("/espacios");
export const getEspacioRequest = (id) => axios.get(`/espacios/${id}`);
export const createEspacioRequest = (espacio) =>
  axios.post("/espacios", espacio);
export const updateEspacioRequest = (id, espacio) =>
  axios.put(`/espacios/${id}`, espacio);
export const deleteEspacioRequest = (id) => axios.delete(`/espacios/${id}`);