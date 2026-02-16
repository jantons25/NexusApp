import { useState, useEffect } from 'react';
import { useRelevo } from '../context/RelevoContext.jsx';
import ModalBig from './ModalBig.jsx';
import RelevosFormPage from './RelevosFormPage.jsx';

function RelevoList({ relevos, products, closeModal, refreshPagina, user, users }) {
  const { deleteRelevos } = useRelevo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelevo, setSelectedRelevo] = useState(null);

  if (relevos === undefined) {
    return <h1>No hay productos</h1>;
  }

  return (
    <div className=" bg-white p-4 w-full">
      <table className="w-full table-auto text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">Recepcionista</th>
            <th className="px-6 py-3">Responsable</th>
            <th className="px-6 py-3">Observacion</th>
            <th className="px-6 py-3">Conformidad</th>
          </tr>
        </thead>
        <tbody>
          {relevos.map((relevo) => (
            <tr
              key={relevo._id}
              className="border-b hover:bg-gray-50 transition duration-150"
            >
              <td className="px-6 py-4 font-medium">
                {relevo.recepcionista}
              </td>
              <td className="px-6 py-4">{relevo.responsable}</td>
              <td className="px-6 py-4">{relevo.observacion}</td>
              <td className="px-6 py-4">{relevo.conformidad}</td>
              <td className="px-6 py-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRelevo(relevo);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteRelevo(relevo._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        component={
          selectedRelevo ? (
            <RelevosFormPage
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
              relevo={selectedRelevo}
              products={products}
              user={user}
              users={users}
            />
          ) : null
        }
      />
    </div>
  );
}

export default RelevoList;