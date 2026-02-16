import axios from "./axios";

export const getVentasRequest = () => axios.get("/ventas");

export const getAllVentasRequest = () => axios.get("/ventas/all");

export const getVentaRequest = (id) => axios.get(`/ventas/${id}`);

export const createVentaRequest = (venta) => axios.post("/ventas", venta);

export const updateLoteVentasRequest = (ventas) =>
    axios.put("/ventas/lote", ventas);
    

export const updateVentaByIdRequest = (id, data) =>
    axios.put(`/ventas/${id}`, data);

export const deleteVentaRequest = (id) => axios.delete(`/ventas/${id}`);

export const deleteLoteVentasRequest = (id_lote) =>
    axios.delete(`/ventas/lote/${id_lote}`);
