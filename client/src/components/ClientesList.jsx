import { useState } from "react";
import { useCliente } from "../context/ClienteContext.jsx";
import ModalBig from "./ModalBig.jsx";
import ClienteForm from "./ClienteForm.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";

function ClientesList({ clientes, refreshPagina }) {
  const { deleteCliente } = useCliente();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [idClienteEliminar, setIdClienteEliminar] = useState(null);

  if (!clientes || clientes.length === 0) {
    return <h1 className="text-center text-gray-600">No hay clientes</h1>;
  }

  const clientesOrdenados = [...clientes].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || "")
  );

  const clientesFiltrados = clientesOrdenados.filter((cliente) =>
    (cliente.nombre || "").toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const confirmarEliminarCliente = async () => {
    try {
      await deleteCliente(idClienteEliminar);
      if (refreshPagina) refreshPagina();
    } catch (error) {
      console.error("Error eliminando cliente:", error);
    } finally {
      setMostrarModalEliminar(false);
      setIdClienteEliminar(null);
    }
  };

  return (
    <div className="bg-white p-4 w-full descripcion__container">
      <h1 className="text-2xl bold font-medium">Lista de Clientes</h1>
      <p className="p_final">
        Administra tu base de datos de clientes de manera centralizada. Consulta
        información de contacto, estados y orígenes de registro para ofrecer
        siempre la mejor atención.
      </p>

      <div className="mt-2 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-2 text-center bg-gray-100">
                <div className="flex flex-col items-center">
                  Nombre
                  <input
                    type="text"
                    placeholder="Buscar nombre"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="mt-1 w-35 text-xs text-black border rounded px-2 py-1 text-center"
                  />
                </div>
              </th>
              <th className="px-6 py-2 text-center bg-amber-100">Correo</th>
              <th className="px-6 py-2 text-center bg-amber-100">Teléfono</th>
              <th className="px-6 py-2 text-center bg-emerald-200">DNI</th>
              <th className="px-6 py-2 text-center bg-emerald-200">Rol</th>
              <th className="px-6 py-2 text-center bg-emerald-200">Estado</th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Último acceso
              </th>
              <th className="px-6 py-2 text-center bg-emerald-200">
                Origen de Registro
              </th>
              <th className="px-6 py-2 text-center bg-gray-100">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr
                key={cliente._id}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 font-medium text-center">
                  {cliente.nombre
                    ? cliente.nombre.charAt(0).toUpperCase() +
                      cliente.nombre.slice(1)
                    : "—"}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {cliente.correo || "—"}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {cliente.telefono || "—"}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {cliente.dni || "—"}
                </td>
                <td className="px-6 py-4 font-medium text-center capitalize">
                  {cliente.rol || "—"}
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      cliente.estado === "activo"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cliente.estado
                      ? cliente.estado.charAt(0).toUpperCase() +
                        cliente.estado.slice(1)
                      : "—"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-center">
                  {cliente.ultimo_acceso
                    ? new Date(cliente.ultimo_acceso).toLocaleDateString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Lima",
                        }
                      )
                    : "—"}
                </td>
                <td className="px-6 py-4 font-medium text-center capitalize">
                  {cliente.origen_registro || "—"}
                </td>
                <td className="px-6 py-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedCliente(cliente);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setIdClienteEliminar(cliente._id);
                      setMostrarModalEliminar(true);
                    }}
                    disabled={cliente.estado === "inactivo"}
                    title={
                      cliente.estado === "inactivo"
                        ? "El cliente ya está desactivado"
                        : "Desactivar cliente"
                    }
                    className={`text-white px-3 py-1 rounded text-xs transition ${
                      cliente.estado === "inactivo"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 cursor-pointer"
                    }`}
                  >
                    {cliente.estado === "inactivo" ? "Inactivo" : "Desactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => {
          setIsModalOpen(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        component={
          selectedCliente ? (
            <ClienteForm
              closeModal={() => {
                setIsModalOpen(false);
                setSelectedCliente(null);
              }}
              refreshPagina={refreshPagina}
              cliente={selectedCliente}
            />
          ) : null
        }
      />

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        isOpen={mostrarModalEliminar}
        onClose={() => {
          setMostrarModalEliminar(false);
          setIdClienteEliminar(null);
        }}
        onConfirm={confirmarEliminarCliente}
        mensaje="¿Estás seguro de que deseas desactivar este cliente? Su estado cambiará a inactivo."
      />
    </div>
  );
}

export default ClientesList;
