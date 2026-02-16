import { useState } from "react";
import "../css/btnOpciones.css";
import ModalBig from "./ModalBig.jsx";
import VentaFormPage from "./VentaFormPage.jsx";

function BtnFormularios({btn1, btn2, btn3, setVistaActiva, vistaActiva}) {
  console.log(vistaActiva)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVistaActiva(""); 
  };

  return (
    <div className=" btn__container">
      {btn1 ? (btn1) : null}
      {btn2 ? (btn2) : null}
      {btn3 ? (btn3) : null}
    </div>
  )
}

export default BtnFormularios;
