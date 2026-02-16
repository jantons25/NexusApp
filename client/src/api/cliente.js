import axios from "./axios";
export const getClientesRequest = () => axios.get("/clientes");

export const getClienteRequest = (id) => axios.get(`/clientes/${id}`);
export const createClienteRequest = (cliente) =>
  axios.post("/clientes", cliente);
export const updateClienteRequest = (id, cliente) =>
  axios.put(`/clientes/${id}`, cliente);
export const changeClientePasswordRequest = (id, passwordData) =>
  axios.patch(`/clientes/${id}/password`, passwordData);
export const deleteClienteRequest = (id) => axios.delete(`/clientes/${id}`);