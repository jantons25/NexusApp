import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getReservasRequest,
  getReservaRequest,
  createReservaRequest,
  updateReservaRequest,
  cancelReservaRequest,
  reprogramarReservaRequest,
  agregarPagoRequest,     
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
        }`,
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
        }`,
      );
    }
  };

  const updateReserva = async (id, reserva) => {
    try {
      const res = await updateReservaRequest(id, reserva);

      console.log("Respuesta de actualización:", res);

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
        }`,
      );
    }
  };

  const cancelReserva = async (id, motivo = "") => {
    try {
      const res = await cancelReservaRequest(id, motivo);

      // Actualizar el estado local: cambiar estado a "cancelada"
      setReservas((prev) => ({
        ...prev,
        data: prev.data.map((item) =>
          item.reserva._id === id
            ? {
                ...item,
                reserva: { ...item.reserva, estado: "cancelada" },
              }
            : item,
        ),
      }));

      // Mostrar información de devolución si la hay
      const { devolucion } = res.data;
      if (devolucion?.requiere_devolucion) {
        toast.success(
          `Reserva cancelada. Devolución: S/${devolucion.monto_a_devolver.toFixed(2)} (${devolucion.porcentaje_devolucion}%)`,
          { duration: 6000 },
        );
      } else {
        toast.success("Reserva cancelada. Sin devolución.");
      }

      return res.data; // Por si el componente necesita mostrar el resumen
    } catch (error) {
      toast.error(
        `Error al cancelar la reserva: ${
          error.response?.data?.mensaje || error.message
        }`,
      );
    }
  };

  const reprogramarReserva = async (id, nuevoInicio, nuevoFin) => {
    try {
      const res = await reprogramarReservaRequest(id, {
        nuevoInicio,
        nuevoFin,
      });

      const { ok, cambio, mensaje, reserva: reservaActualizada } = res.data;

      if (ok && cambio) {
        // Hubo cambio real: reemplazamos solo el item afectado en el estado.
        // Conservamos el detalle previo porque reprogramar no toca pagos ni importes.
        setReservas((prev) => {
          const nuevoData = prev.data.map((item) => {
            if (item.reserva._id === id) {
              return {
                reserva: reservaActualizada, // ← fechas actualizadas + populate completo
                detalle: item.detalle, // ← detalle sin cambios (pagos, importe)
              };
            }
            return item;
          });
          return { ...prev, data: nuevoData };
        });

        toast.success("Reserva reprogramada correctamente");
      } else if (ok && !cambio) {
        // El backend procesó bien pero las fechas eran idénticas a las actuales.
        toast(
          "Las fechas indicadas son iguales a las actuales. No se realizaron cambios.",
          {
            icon: "ℹ️",
          },
        );
      }

      return true;
    } catch (error) {
      toast.error(
        `Error al reprogramar la reserva: ${
          error.response?.data?.mensaje || error.message
        }`,
      );
      return false;
    }
  };

  const agregarPago = async (id, pagoData) => {
    try {
      // Llamamos al endpoint PATCH /reservas/:id/pago
      // enviando el id de la reserva y los datos del pago
      const res = await agregarPagoRequest(id, pagoData);
  
      // El servicio nos devuelve la reserva completa actualizada
      // con los nuevos pagos ya incluidos dentro de detalle.pagos.
      // Usamos map() para reemplazar SOLO la reserva que fue modificada
      // dejando todas las demás intactas en el estado global.
      setReservas((prev) => {
        const nuevoData = prev.data.map((item) => {
          if (item.reserva._id === id) {
            // Reemplazamos el item completo con la data fresca del servidor
            return {
              reserva: res.data.reserva,
              detalle: res.data.reserva.detalle || item.detalle,
            };
          }
          return item; // Las demás reservas no se tocan
        });
  
        return {
          ...prev,
          data: nuevoData,
          pagination: prev.pagination, // La paginación no cambia
        };
      });
  
      toast.success("Pago agregado correctamente");
  
      // Retornamos la respuesta completa por si el componente que llama
      // necesita usar el resumen financiero (saldo_pendiente, estado_pago, etc.)
      return res.data;
    } catch (error) {
      toast.error(
        `Error al agregar el pago: ${
          error.response?.data?.mensaje || error.message
        }`
      );
      // Relanzamos el error para que el componente que llama
      // pueda reaccionar si lo necesita (ej: no cerrar un modal)
      throw error;
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
        reprogramarReserva,
        agregarPago,   
      }}
    >
      {children}
    </ReservaContext.Provider>
  );
}
