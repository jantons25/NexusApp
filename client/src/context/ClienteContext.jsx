import { toast } from "react-hot-toast";
import { createContext, useContext, useState } from "react";
import {
  getClientesRequest,
  getClienteRequest,
  createClienteRequest,
  updateClienteRequest,
  changeClientePasswordRequest,
  deleteClienteRequest,
} from "../api/cliente.js";

const ClienteContext = createContext();

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useCliente must be used within a ClienteProvider");
  }
  return context;
};

export function ClienteProvider({ children }) {
  const [clientes, setClientes] = useState([]);

  const getClientes = async () => {
    try {
      const res = await getClientesRequest();
      setClientes(res.data);
    } catch (error) {
      toast.error(
        `Error al obtener los clientes: ${error.response.data.error}`
      );
    }
  };

  const getCliente = async (id) => {
    try {
      const res = await getClienteRequest(id);
      return res.data;
    } catch (error) {
      toast.error(`Error al obtener el cliente: ${error.response.data.error}`);
    }
  };

  const createCliente = async (cliente) => {
    try {
      const res = await createClienteRequest(cliente);
      console.log(res.data);
      setClientes((prev) => [...prev, res.data.cliente]);
      toast.success("Cliente creado");
    } catch (error) {
      toast.error(`Error al crear el cliente: ${error.response.data.error}`);
    }
  };

  const updateCliente = async (id, cliente) => {
    try {
      const res = await updateClienteRequest(id, cliente);
      setClientes((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      toast.success("Cliente actualizado");
    } catch (error) {
      toast.error(
        `Error al actualizar el cliente: ${error.response.data.error}`
      );
    }
  };

  const changeClientePassword = async (id, passwordData) => {
    try {
      await changeClientePasswordRequest(id, passwordData);
      toast.success("Contraseña cambiada");
    } catch (error) {
      toast.error(
        `Error al cambiar la contraseña: ${error.response.data.error}`
      );
    }
  };

  const deleteCliente = async (id) => {
    try {
      const res = await deleteClienteRequest(id);
      if (res.status === 204) {
        setClientes((prev) => prev.filter((cliente) => cliente._id !== id));
        toast.success("Cliente eliminado");
      }
    } catch (error) {
      toast.error(`Error al eliminar el cliente: ${error.response.data.error}`);
    }
  };

  return (
    <ClienteContext.Provider
      value={{
        clientes,
        getClientes,
        getCliente,
        createCliente,
        updateCliente,
        changeClientePassword,
        deleteCliente,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
}
