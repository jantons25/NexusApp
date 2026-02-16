// context/CortesiaContext.jsx
import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getCortesiasRequest,
  createCortesiaRequest,
  updateCortesiaLoteRequest,
  deleteCortesiaRequest,
  deleteLoteCortesiasRequest,
} from "../api/cortesia.js";

const CortesiaContext = createContext();

export const useCortesia = () => {
  const context = useContext(CortesiaContext);
  if (!context) {
    throw new Error("useCortesia must be used within a CortesiaProvider");
  }
  return context;
};

export function CortesiaProvider({ children }) {
  const [cortesias, setCortesias] = useState([]);

  const getCortesias = async () => {
    try {
      const res = await getCortesiasRequest();
      // El controlador de getCortesias debería devolver un array de cortesías
      setCortesias(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener las cortesías: ${error.response.data.error}`
      );
    }
  };

  const deleteCortesia = async (id) => {
    try {
      const res = await deleteCortesiaRequest(id);
      if (res.status === 200) {
        setCortesias((prev) => prev.filter((cortesia) => cortesia._id !== id));
        toast.success("Cortesía eliminada");
      }
    } catch (error) {
      toast.error(
        `Error al eliminar la cortesía: ${error.response.data.error}`
      );
    }
  };

  const deleteLoteCortesias = async (id_lote) => {
    try {
      await deleteLoteCortesiasRequest(id_lote);
      // Opcional: podrías limpiar el state local filtrando por id_lote
      setCortesias((prev) =>
        prev.filter((cortesia) => cortesia.id_lote !== id_lote)
      );
      toast.success("Lote de cortesías eliminado");
    } catch (error) {
      toast.error(
        `Error al eliminar el lote de cortesías: ${error.response.data.error}`
      );
    }
  };

  const createCortesia = async (data) => {
    try {
      // data puede ser una cortesía o un array de cortesías
      const res = await createCortesiaRequest(data);
      const nuevas = Array.isArray(res.data.cortesias)
        ? res.data.cortesias
        : [];
      setCortesias((prev) => [...prev, ...nuevas]);
      toast.success("Cortesía registrada");
    } catch (error) {
      toast.error(`Error al crear cortesías: ${error.response.data.error}`);
    }
  };

  const updateLoteCortesia = async ({ ids, nuevasCortesias }) => {
    try {
      const res = await updateCortesiaLoteRequest({
        ids,
        nuevasCortesias,
      });

      const nuevas = Array.isArray(res.data.cortesias)
        ? res.data.cortesias
        : [];

      setCortesias((prev) => {
        const idsSet = new Set(ids);
        // Quitamos del state las cortesías antiguas de ese lote
        const filtradas = prev.filter((c) => !idsSet.has(c._id));
        // Agregamos las nuevas versiones
        return [...filtradas, ...nuevas];
      });

      toast.success("Lote de cortesías actualizado");
      return nuevas;
    } catch (error) {
      toast.error(
        `Error al actualizar el lote de cortesías: ${error.response.data.error}`
      );
    }
  };

  return (
    <CortesiaContext.Provider
      value={{
        cortesias,
        getCortesias,
        createCortesia,
        deleteCortesia,
        deleteLoteCortesias,
        updateLoteCortesia,
      }}
    >
      {children}
    </CortesiaContext.Provider>
  );
}
