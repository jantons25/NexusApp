import { useEffect } from "react";
import { useProduct } from "../context/ProductContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import MaquetaHtml from "../components/MaquetaHtml.jsx";
import OptInventarioCentral from "../components/OptInventarioCentral.jsx";
import OptInventarioRecepcion from "../components/OptInventarioRecepcion.jsx.jsx";

function Ventas() {
  const { getProducts, products, getAllProducts } = useProduct();
  const { user } = useAuth();

  useEffect(() => {
    if (user.role === "admin") {
      getAllProducts();
    } else if (user.role === "user") {
      getProducts();
    }
  }, []);

  return (
    <div>
      <MaquetaHtml
        user={user}
        products={products}
        opt1={user?.role === "admin" ? <OptInventarioCentral /> : null}
        opt2={<OptInventarioRecepcion />}
        pagina="Ventas"
      />
    </div>
  );
}

export default Ventas;
