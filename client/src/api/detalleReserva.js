import axios from "./axios";
export const createReservaDetalleRequest = (reservaId, detalleData) =>
  axios.post(`/reservas/${reservaId}/detalle`, detalleData);
export const createReservaDetallePagoRequest = (reservaId, pagoData) =>
  axios.post(`/reservas/${reservaId}/detalle/pagos`, pagoData);