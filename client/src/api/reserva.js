import axios from "./axios";
export const getReservasRequest = () => axios.get("/reservas");
export const getReservaRequest = (id) => axios.get(`/reservas/${id}`);
export const createReservaRequest = (reserva) =>
  axios.post("/reservas", reserva);
export const updateReservaRequest = (id, reserva) =>
  axios.patch(`/reservas/${id}`, reserva)
export const cancelReservaRequest = (id, motivo = "") =>
  axios.patch(`/reservas/${id}/cancelar`, { motivo_cancelacion: motivo });
export const reprogramarReservaRequest = (id, fechas) =>
  axios.patch(`/reservas/${id}/reprogramar`, fechas);
export const agregarPagoRequest = (id, pago) =>
  axios.patch(`/reservas/${id}/pago`, pago);
