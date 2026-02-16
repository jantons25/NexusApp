import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  createReservaDetalleRequest,
  createReservaDetallePagoRequest,
} from "../api/detalleReserva.js";

const DetalleReservaContext = createContext();

export const useDetalleReserva = () => {
  const context = useContext(DetalleReservaContext);
  if (!context) {
    throw new Error(
      "useDetalleReserva must be used within a DetalleReservaProvider"
    );
  }
  return context;
};

export function DetalleReservaProvider({ children }) {
  const [detalleReserva, setDetalleReserva] = useState(null);

  const createDetalleReserva = async (reservaId, detalleData) => {
    try {
      const res = await createReservaDetalleRequest(reservaId, detalleData);
      setDetalleReserva(res.data);
      toast.success("Detalle de reserva creado");
      return res.data;
    } catch (error) {
      toast.error(
        `Error al crear el detalle de reserva: ${error.response.data.error}`
      );
    }
  };

  const createPagoDetalleReserva = async (reservaId, pagoData) => {
    try {
      const res = await createReservaDetallePagoRequest(reservaId, pagoData);
      setDetalleReserva(res.data);
      toast.success("Pago agregado al detalle de reserva");
      return res.data;
    } catch (error) {
      toast.error(
        `Error al agregar el pago al detalle de reserva: ${error.response.data.error}`
      );
    }
  };

  return (
    <DetalleReservaContext.Provider
      value={{ detalleReserva, createDetalleReserva, createPagoDetalleReserva }}
    >
      {children}
    </DetalleReservaContext.Provider>
  );
}
