import axios from "./axios";

// Obtener salidas del usuario actual
export const getSalidasRequest = () => axios.get("/salidas");

// Obtener todas las salidas (modo admin)
export const getAllSalidasRequest = () => axios.get("/salidas/all");

// Obtener una salida por ID
export const getSalidaRequest = (id) => axios.get(`/salidas/${id}`);

// Crear una o más salidas (individual o lote)
export const createSalidaRequest = (salida) => axios.post("/salidas", salida);

// Actualizar una salida individual
export const updateSalidaRequest = (id, salida) =>
  axios.put(`/salidas/${id}`, salida);

// Actualizar un lote de salidas
export const updateLoteSalidasRequest = (data) =>
  axios.put("/salidas/lote", data);

// data debe tener: { ids: [...], nuevasSalidas: [...] }

// Eliminar una salida individual
export const deleteSalidaRequest = (id) => axios.delete(`/salidas/${id}`);

// Eliminar un lote de salidas
export const deleteLoteSalidasRequest = (id_lote) =>
  axios.delete(`/salidas/lote/${id_lote}`);

// Eliminar un lote de salidas
export const deleteLoteSalidasCompletosRequest = (id_lote) =>
  axios.delete(`/salidas/lote/completo/${id_lote}`);
