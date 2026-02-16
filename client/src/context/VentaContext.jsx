import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  createVentaRequest,
  getVentasRequest,
  deleteVentaRequest,
  getAllVentasRequest,
  updateLoteVentasRequest,
  deleteLoteVentasRequest,
  updateVentaByIdRequest,
} from "../api/ventas.js";

const VentaContext = createContext();

export const useVenta = () => {
  const context = useContext(VentaContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};

export function VentaProvider({ children }) {
  const [ventas, setVentas] = useState([]);

  const getVentas = async () => {
    try {
      const res = await getVentasRequest();
      setVentas(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener todas las ventas: ${error.response.data.error}`
      );
    }
  };

  const getAllVentas = async () => {
    try {
      const res = await getAllVentasRequest();
      setVentas(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener todas las salidas: ${error.response.data.error}`
      );
    }
  };

  const deleteVenta = async (id) => {
    try {
      const res = await deleteVentaRequest(id);
      if (res.status === 204) {
        setVentas((prevVentas) =>
          prevVentas.filter((venta) => venta._id !== id)
        );
        toast.success("Venta eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la venta: ${error.response.data.error}`);
    }
  };

  const deleteLoteVentas = async (id_lote) => {
    try {
      await deleteLoteVentasRequest(id_lote);
      toast.success("Lote de ventas eliminado");
    } catch (error) {
      toast.error(
        `No se pudo eliminar el lote de ventas: ${error.response.data.error}`
      );
    }
  };

  const createVenta = async (data) => {
    try {
      const res = await createVentaRequest(data);
      setVentas((prevVentas) => [...prevVentas, res.data]);
      toast.success("Venta registrada con éxito");
    } catch (error) {
      toast.error(`Error al registrar salidas: ${error.response.data.error}`);
    }
  };

  const updateLoteVentas = async ({ ids, nuevasVentas }) => {
    try {
      const res = await updateLoteVentasRequest({ ids, nuevasVentas });
      setVentas((prevVentas) => {
        const idsSet = new Set(ids);
        const ventasFiltradas = prevVentas.filter((v) => !idsSet.has(v._id));
        return [...ventasFiltradas, ...nuevasVentas];
      });
      toast.success("Lote de ventas actualizado");
      return res.data;
    } catch (error) {
      toast.error(
        `Error al obtener todas las salidas: ${error.response.data.error}`
      );
    }
  };

  const updateVentaById = async (id, data) => {
    try {
      const res = await updateVentaByIdRequest(id, data);
      setVentas((prev) =>
        prev.map((venta) => (venta._id === id ? res.data.venta : venta))
      );
      toast.success("Venta actualizada correctamente");
      return res.data;
    } catch (error) {
      toast.error(`Error al actualizar venta: ${error.response.data.error}`);
    }
  };

  return (
    <VentaContext.Provider
      value={{
        ventas,
        createVenta,
        getVentas,
        getAllVentas,
        deleteVenta,
        updateLoteVentas,
        deleteLoteVentas,
        updateVentaById,
      }}
    >
      {children}
    </VentaContext.Provider>
  );
}
