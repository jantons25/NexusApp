import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getEspaciosRequest,
  getEspacioRequest,
  createEspacioRequest,
  updateEspacioRequest,
  deleteEspacioRequest,
} from "../api/espacio.js";

const EspacioContext = createContext();

export const useEspacio = () => {
  const context = useContext(EspacioContext);
  if (!context) {
    throw new Error("useEspacio must be used within a EspacioProvider");
  }
  return context;
};

export function EspacioProvider({ children }) {
  const [espacios, setEspacios] = useState([]);

  const getEspacios = async () => {
    try {
      const res = await getEspaciosRequest();
      setEspacios(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener los espacios: ${error.response.data.error}`
      );
    }
  };

  const getEspacio = async (id) => {
    try {
      const res = await getEspacioRequest(id);
      return res.data;
    } catch (error) {
      toast.error(`Error al obtener el espacio: ${error.response.data.error}`);
    }
  };

  const createEspacio = async (espacio) => {
    try {
      const res = await createEspacioRequest(espacio);
      setEspacios((prev) => [...prev, res.data.espacio]);
      toast.success("Espacio creado");
    } catch (error) {
      toast.error(`Error al crear el espacio: ${error.response.data.error}`);
    }
  };

  const updateEspacio = async (id, espacio) => {
    try {
      const res = await updateEspacioRequest(id, espacio);
      setEspacios((prev) => {
        prev.map((e) => {
          e._id === id ? res.data : e;
        });
      });
      toast.success("Espacio actualizado");
    } catch (error) {
      toast.error(
        `Error al actualizar el espacio: ${error.response.data.error}`
      );
    }
  };

  const deleteEspacio = async (id) => {
    try {
      const res = await deleteEspacioRequest(id);
      if (res.status === 204) {
        setEspacios((prev) => prev.filter((espacio) => espacio._id !== id));
        toast.success("Espacio eliminado");
      }
    } catch (error) {
      toast.error(`Error al eliminar el espacio: ${error.response.data.error}`);
    }
  };

  return (
    <EspacioContext.Provider
      value={{
        espacios,
        getEspacios,
        getEspacio,
        createEspacio,
        updateEspacio,
        deleteEspacio,
      }}
    >
      {children}
    </EspacioContext.Provider>
  );
}
