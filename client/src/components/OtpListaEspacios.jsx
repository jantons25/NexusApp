import MenuIcon from "../assets/cuadricula.png";

function OptListaEspacios({ onClick }) {
  return (
    <li className="menu__flotante__item" onClick={onClick}>
      <img src={MenuIcon} alt="" className="menu__flotante__icon" />
      <div className="menu__flotante__hide">
        <p className="menu__flotante__text">Espacios</p>
      </div>
    </li>
  );
}

export default OptListaEspacios;