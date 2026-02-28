import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { productSchema } from "../validations/product.schema.js";
import { useProduct } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProductFormPage({ closeModal, refreshPagina, product }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(productSchema),
  });

  const { createProduct, updateProduct } = useProduct();
  const [actualizando, setActualizando] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (product && product._id) {
        await updateProduct(product._id, data);
      } else {
        await createProduct(data);
      }
      closeModal();
      refreshPagina();
    } catch (err) {
      console.error("Error al guardar producto:", err);
    } finally {
      setIsSubmitting(false);
    }
  });

  useEffect(() => {
    if (product) {
      reset(product);
      setActualizando(true);
    }
  }, [product]);

  return (
    <div className="bg-white w-[420px] p-5 rounded-md">
      <form onSubmit={onSubmit}>
        {actualizando ? (
          <label className="flex text-sm font-semibold text-gray-700">
            Producto
          </label>
        ) : (
          ""
        )}
        <input
          type="text"
          placeholder="Nombre"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("nombre")}
          autoFocus
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm">{errors.nombre.message}</p>
        )}
        {actualizando ? (
          <label className="flex text-sm font-semibold text-gray-700">
            Categoría
          </label>
        ) : (
          ""
        )}

        {/* Select Categoría */}
        <div className="relative my-2">
          <select
            {...register("categoria")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md appearance-none pr-8"
          >
            <option value="">Seleccione Categoría</option>
            <option value="Galletas">Galletas</option>
            <option value="Gaseosas">Gaseosas</option>
            <option value="Chocolate">Chocolate</option>
            <option value="Snacks">Snacks</option>
            <option value="Sopas">Sopas</option>
            <option value="Frugos">Frugos</option>
            <option value="Agua Mineral">Agua Mineral</option>
            <option value="Energizante">Energizante</option>
            <option value="Aseo">Aseo</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Otros">Otros</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {errors.categoria && (
          <p className="text-red-500 text-sm">{errors.categoria.message}</p>
        )}
        {actualizando ? (
          <label className="flex text-sm font-semibold text-gray-700">
            Precio
          </label>
        ) : (
          ""
        )}
        <input
          type="number"
          step="any"
          placeholder="Precio de venta por unidad"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("precio_venta")}
        />
        {errors.precio_venta && (
          <p className="text-red-500 text-sm">{errors.precio_venta.message}</p>
        )}
        <div className="w-full flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 mt-5 rounded-md my-2 text-zinc-800
    ${
      isSubmitting
        ? "bg-gray-400 cursor-not-allowed opacity-60"
        : "bg-amber-300 hover:bg-yellow-300 hover:text-black cursor-pointer"
    }`}
          >
            {isSubmitting
              ? "Guardando..."
              : actualizando
              ? "Actualizar"
              : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductFormPage;
