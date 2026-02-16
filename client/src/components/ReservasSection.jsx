import ReservaList from "./ReservasList";
import ClientesList from "./ClientesList";
import EspaciosList from "./EspaciosList";
import ReservasData from "./ReservasData";

function ReservasSection({
  vistaActiva,
  user,
  reservas,
  clientes,
  espacios,
  detalleReservas,
  closeModal,
  refreshPagina,
}) {
  if (vistaActiva === "Reservas") {
    return (
      <ReservaList
        reservas={reservas}
        clientes={clientes}
        espacios={espacios}
        detalleReservas={detalleReservas}
        F
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Clientes") {
    return (
      <ClientesList
        clientes={clientes}
        reservas={reservas}
        espacios={espacios}
        detalleReservas={detalleReservas}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  if (vistaActiva === "Espacios") {
    return (
      <EspaciosList
        clientes={clientes}
        reservas={reservas}
        espacios={espacios}
        detalleReservas={detalleReservas}
        closeModal={closeModal}
        refreshPagina={refreshPagina}
      />
    );
  }

  return (
    <ReservasData
      reservas={reservas}
      clientes={clientes}
      espacios={espacios}
      detalleReservas={detalleReservas}
      closeModal={closeModal}
      refreshPagina={refreshPagina}
    />
  );
}

export default ReservasSection;
