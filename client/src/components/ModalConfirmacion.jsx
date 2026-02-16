import React from "react";

function ModalConfirmacion({ isOpen, onClose, onConfirm, mensaje, confimacion = "Confirmar" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md text-center">
        <p className="mb-4">
          {mensaje}
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
            onClick={onConfirm}
          >
            {confimacion}
          </button>
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;
