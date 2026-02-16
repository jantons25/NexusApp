import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { compraItemSchema } from "../validations/compraSchema.js";
import { useCompra } from "../context/CompraContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

function CompraFormPage({ closeModal, refreshPagina, compra, products }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(compraItemSchema),
  });

  const { createCompra, updateCompra } = useCompra();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const parseLocalDate = (dateString) => {
      const [year, month, day] = dateString.split("-");
      return new Date(year, month - 1, day);
    };

    const fechaCorrecta = parseLocalDate(data.fecha_vencimiento);
    const dataParsed = {
      ...data,
      fecha_vencimiento: fechaCorrecta,
      importe_compra: data.cantidad * data.precio_compra,
    };

    try {
      if (compra && compra._id) {
        await updateCompra(compra._id, dataParsed);
        toast.success("Compra actualizada correctamente");
      } else {
        await createCompra(dataParsed);
        toast.success("Compra registrada correctamente");
      }
      closeModal();
      refreshPagina();
    } catch (err) {
      console.error("Error en proceso de compra:", err);
      toast.error("Ocurrió un error al guardar la compra");
    }
  });

  useEffect(() => {
    if (compra) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          return new Date(dateString).toISOString().split("T")[0];
        } catch (e) {
          console.error("Error formateando fecha:", e);
          return "";
        }
      };
      reset({
        ...compra,
        producto: compra.producto?._id || compra.producto,
        fecha_vencimiento: formatDateForInput(compra.fecha_vencimiento),
      });
    }
  }, [compra]);

  return (
    <div className="bg-white w-full p-5 rounded-md">
      <form onSubmit={onSubmit}>
        <select
          {...register("producto")}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.nombre}
            </option>
          ))}
        </select>
        {errors.producto && (
          <p className="text-red-500 text-sm">{errors.producto.message}</p>
        )}

        <input
          type="number"
          placeholder="Cantidad"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("cantidad")}
        />
        {errors.cantidad && (
          <p className="text-red-500 text-sm">{errors.cantidad.message}</p>
        )}

        <input
          type="number"
          step="any"
          placeholder="Precio de compra por unidad"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("precio_compra")}
        />
        {errors.precio_compra && (
          <p className="text-red-500 text-sm">{errors.precio_compra.message}</p>
        )}

        <input
          type="date"
          step="any"
          placeholder="Fecha de vencimiento"
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("fecha_vencimiento")}
        />
        {errors.fecha_vencimiento && (
          <p className="text-red-500 text-sm">
            {errors.fecha_vencimiento.message}
          </p>
        )}

        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-amber-300 text-zinc-800 px-4 py-2 mt-5 rounded-md hover:bg-yellow-300 hover:text-black my-2"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompraFormPage;