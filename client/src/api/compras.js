import axios from "./axios";

export const getComprasRequest = () => axios.get("/compras");

export const getAllComprasRequest = () => axios.get("/compras/all");

export const getCompraRequest = (id) => axios.get(`/compras/${id}`);

export const createCompraRequest = (compra) => axios.post("/compras", compra);

export const updateLoteComprasRequest = (compras) =>
  axios.put("/compras/lote", compras);

export const updateCompraRequest = (id, compra) =>
  axios.put(`/compras/${id}`, compra);

export const deleteCompraRequest = (id) => axios.delete(`/compras/${id}`);

export const deleteLoteComprasRequest = (id_lote) =>
  axios.delete(`/compras/lote/${id_lote}`);
