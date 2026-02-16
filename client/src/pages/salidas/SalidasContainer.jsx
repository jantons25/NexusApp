import { useEffect, useState } from 'react';
import { useProduct } from '../../context/ProductContext.jsx';
import { useSalida } from '../../context/SalidaContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import MaquetaHtml from '../../components/MaquetaHtml.jsx';
import OptAgregarSalida from '../../components/OptAgregarSalida.jsx';

function SalidaContainer() {
  const { getAllProducts, products } = useProduct();
  const { salidas, getAllSalidas } = useSalida();
  const { user } = useAuth();
  const [vistaActiva, setVistaActiva] = useState('');

  const refreshPagina = () => {
    getAllSalidas();
    getAllProducts();
  };

  useEffect(() => {
    refreshPagina();
  }, []);

  return (
    <MaquetaHtml
      user={user}
      products={products}
      salidas={salidas}
      opt1={
        user?.role === 'admin' ? (
          <OptAgregarSalida onClick={() => setVistaActiva('AgregarSalida')} />
        ) : null
      }
      pagina="Salidas"
      vistaActiva={vistaActiva}
      setVistaActiva={setVistaActiva}
      refreshPagina={refreshPagina}
    />
  );
}

export default SalidaContainer;
