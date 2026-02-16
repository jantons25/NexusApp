import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getReservasRequest,
  getReservaRequest,
  createReservaRequest,
  updateReservaRequest,
  cancelReservaRequest,
} from "../api/reserva.js";

const ReservaContext = createContext();

export const useReserva = () => {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error("useReserva must be used within a ReservaProvider");
  }
  return context;
};

export function ReservaProvider({ children }) {
  const [reservas, setReservas] = useState({
    data: [], // Array de reservas
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    },
  });

  const getReservas = async () => {
    try {
      const res = await getReservasRequest();
      // La API devuelve: {data: [...], pagination: {...}}
      setReservas(res.data); // Guardar la estructura completa
    } catch (error) {
      toast.error(
        `Error al obtener las reservas: ${
          error.response?.data?.error || error.message
        }`
      );
      // Inicializar con estructura vacía pero correcta
      setReservas({
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });
    }
  };

  const getReserva = async (id) => {
    try {
      const res = await getReservaRequest(id);
      return res.data;
    } catch (error) {
      toast.error(`Error al obtener la reserva: ${error.response.data.error}`);
    }
  };

  const createReserva = async (reservaData) => {
    try {
      const res = await createReservaRequest(reservaData);

      setReservas((prev) => {
        // Crear el objeto con la estructura correcta
        const nuevoItem = {
          reserva: res.data.reserva, // ← Reserva completa
          detalle: res.data.detalle || null, // ← Detalle o null
        };

        return {
          ...prev,
          data: [...prev.data, nuevoItem], // ← Agregar el objeto completo
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total + 1,
          },
        };
      });

      toast.success("Reserva creada");
    } catch (error) {
      toast.error(
        `Error al crear la reserva: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const updateReserva = async (id, reserva) => {
    try {
      const res = await updateReservaRequest(id, reserva);

      setReservas((prev) => {
        const nuevoItem = {
          reserva: res.data.reserva,
          detalle: res.data.detalle || null,
        };

        // CORRECCIÓN: Usar map para reemplazar el elemento específico
        const nuevoData = prev.data.map((item) => {
          // Comparar el _id dentro de reserva
          if (item.reserva._id === id) {
            return nuevoItem; // Reemplazar el elemento completo
          }
          return item; // Mantener los demás
        });

        // Retornar la nueva estructura de estado completa
        return {
          ...prev,
          data: nuevoData,
          // No modificar pagination.total porque no estamos agregando/eliminando
          pagination: prev.pagination,
        };
      });

      toast.success("Reserva actualizada");
    } catch (error) {
      toast.error(
        `Error al actualizar la reserva: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const cancelReserva = async (id) => {
    try {
      const res = await cancelReservaRequest(id);
      toast.success("Reserva cancelada");
    } catch (error) {
      toast.error(`Error al cancelar la reserva: ${error.response.data.error}`);
    }
  };

  return (
    <ReservaContext.Provider
      value={{
        reservas,
        createReserva,
        getReservas,
        getReserva,
        updateReserva,
        cancelReserva,
      }}
    >
      {children}
    </ReservaContext.Provider>
  );
}
