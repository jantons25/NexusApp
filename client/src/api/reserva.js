import axios from "./axios";
export const getReservasRequest = () => axios.get("/reservas");
export const getReservaRequest = (id) => axios.get(`/reservas/${id}`);
export const createReservaRequest = (reserva) =>
  axios.post("/reservas", reserva);
export const updateReservaRequest = (id, reserva) =>
  axios.patch(`/reservas/${id}`, reserva);
export const cancelReservaRequest = (id) =>
  axios.patch(`/reservas/${id}/cancelar`);