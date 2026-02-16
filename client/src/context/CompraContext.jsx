import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  createCompraRequest,
  getCompraRequest,
  getComprasRequest,
  deleteCompraRequest,
  updateCompraRequest,
  getAllComprasRequest,
  updateLoteComprasRequest,
  deleteLoteComprasRequest,
} from "../api/compras.js";

const CompraContext = createContext();

export const useCompra = () => {
  const context = useContext(CompraContext);
  if (!context) {
    throw new Error("useCompra must be used within a CompraProvider");
  }
  return context;
};

export function ComprasProvider({ children }) {
  const [compras, setCompras] = useState([]);

  const getCompras = async () => {
    try {
      const res = await getComprasRequest();
      setCompras(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener todas las compras: ${error.response.data.error}`
      );
    }
  };

  const getAllCompras = async () => {
    try {
      const res = await getAllComprasRequest();
      setCompras(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener todas las compras: ${error.response.data.error}`
      );
    }
  };

  const deleteCompra = async (id) => {
    try {
      const res = await deleteCompraRequest(id);
      if (res.status === 204) {
        setCompras((prev) => prev.filter((compra) => compra._id !== id));
        toast.success("Compra eliminada");
      }
    } catch (error) {
      toast.error(`Error al eliminar la compra: ${error.response.data.error}`);
    }
  };

  const deleteLoteCompras = async (id_lote) => {
    try {
      const res = await deleteLoteComprasRequest(id_lote);
      if (res.status === 200) {
        setCompras((prev) => prev.filter((s) => s.id_lote !== id_lote));
        toast.success("Lote de compras eliminado");
      }
    } catch (error) {
      toast.error(
        `No se pudo eliminar el lote de compras: ${error.response.data.error}`
      );
    }
  };

  const createCompra = async (data) => {
    try {
      const res = await createCompraRequest(data);
      setCompras((prev) => [...prev, res.data]);
      toast.success("Compra registrada con éxito");
    } catch (error) {
      toast.error(`Error al registrar la compra: ${error.response.data.error}`);
    }
  };

  const updateCompra = async (id, data) => {
    try {
      const res = await updateCompraRequest(id, data);
      setCompras((prev) =>
        prev.map((compra) => (compra._id === id ? res.data.compra : compra))
      );
      toast.success("Compra actualizada correctamente");
      return res.data;
    } catch (error) {
      toast.error(
        `No se pudo actualizar la compra: ${error.response.data.error}`
      );
    }
  };

  const updateLoteCompras = async ({ ids, nuevasCompras }) => {
    try {
      const res = await updateLoteComprasRequest({ ids, nuevasCompras });
      setCompras((prevCompras) => {
        const idsSet = new Set(ids);
        const comprasFiltradas = prevCompras.filter((v) => !idsSet.has(v._id));
        return [...comprasFiltradas, ...nuevasCompras];
      });
      toast.success("Lote de compras actualizado");
      return res.data;
    } catch (error) {
      toast.error(
        `Error al actualizar lote de compras: ${error.response.data.error}`
      );
    }
  };

  return (
    <CompraContext.Provider
      value={{
        compras,
        createCompra,
        getCompras,
        getAllCompras,
        deleteCompra,
        deleteLoteCompras,
        updateCompra,
        updateLoteCompras,
      }}
    >
      {children}
    </CompraContext.Provider>
  );
}
