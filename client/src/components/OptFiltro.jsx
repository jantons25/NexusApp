import MenuIcon from "../assets/filtrar.png";

function OptFiltro({ onClick }) {
  return (
    <li className="menu__agregar__item" onClick={onClick}>
      <img src={MenuIcon} alt="" className="menu__agregar__icon" />
      <div className="menu__agregar__hide">
        <p className="menu__agregar__text">&nbsp;Filtrar</p>
      </div>
    </li>
  );
}

export default OptFiltro;