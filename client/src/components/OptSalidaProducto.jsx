import MenuIcon from "../assets/home.svg";

function OptSalidaProducto() {
  return (
    <li className="menu__flotante__item">
      <img src={MenuIcon} alt="" className="menu__flotante__icon" />
      <div className="menu__flotante__hide">
        <p className="menu__flotante__text">Salida</p>
      </div>
    </li>
  );
}

export default OptSalidaProducto;
