import { useForm } from "react-hook-form";
import { useCortesia } from "../context/CortesiaContext.jsx";
import { useProduct } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function CortesiaFormPage({ closeModal, refreshPagina, cortesia, products, user }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();
  const { createCortesia, updateCortesia } = useCortesia();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    if (cortesia && cortesia._id) {
      try {
        const dataParsed = {
            ...data,
            responsable: user.name,
          };
        await updateCortesia(cortesia._id, dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error actualizando cortesia:", err);
      }
    } else {
      try {
        const dataParsed = {
            ...data,
            responsable: user.name,
          };
        await createCortesia(dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error creando cortesia:", err);
      }
    }
  });

  useEffect(() => {
    if (cortesia) {
      reset({
        ...cortesia,
        producto: cortesia.producto?._id || cortesia.producto,
      });
    }
  }, [cortesia]);

  return (
    <div className="bg-zinc-800 max-w-md p-10 rounded-md">
      <form onSubmit={onSubmit}>
        <select
          {...register("producto", { required: true })}
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          {...register("cantidad", { required: true, valueAsNumber: true })}
        />
        <input
          type="text"
          placeholder="Observación"
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          {...register("observacion", { required: true })}
        />
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="text-white px-4 py-2 rounded-md border-white border-2 hover:bg-white hover:text-zinc-800 my-2"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CortesiaFormPage;


