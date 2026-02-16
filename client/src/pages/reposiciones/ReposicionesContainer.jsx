import { useEffect, useState } from "react";
import { useProduct } from "../../context/ProductContext.jsx";
import { useReposicion } from "../../context/ReposicionContext.jsx";
import { useAuth } from "../../context/AuthContext";
import MaquetaHtml from "../../components/MaquetaHtml";
import OptAgregarReposicion from "../../components/OptAgregarReposicion.jsx";

function ReposicionesContainer() {
  const { getAllProducts, products } = useProduct();
  const { reposiciones, getReposiciones } = useReposicion();
  const { user } = useAuth();
  const [vistaActiva, setVistaActiva] = useState('');

  const refreshPagina = () => {
    getAllProducts();
    getReposiciones();
  };

  useEffect(() => {
    refreshPagina();
  }, []);

  return (
    <MaquetaHtml
      user={user}
      products={products}
      reposiciones={reposiciones}
      pagina="Reposiciones"
      vistaActiva={vistaActiva}
      setVistaActiva={setVistaActiva}
      refreshPagina={refreshPagina}
      opt1={
        user?.role === "admin" ? (
          <OptAgregarReposicion
            onClick={() => setVistaActiva("AgregarReposicion")}
          />
        ) : null
      }
    />
  );
}

export default ReposicionesContainer;