import { useForm } from "react-hook-form";
import { useSalida } from "../context/SalidaContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function SalidaFormPage({ closeModal, refreshPagina, salida, products }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { createSalida, updateSalida } = useSalida();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const parseLocalDate = (dateString) => {
      const [year, month, day] = dateString.split('-');
      return new Date(year, month - 1, day);
    };
    if (salida && salida._id) {
      try {
        const fechaCorrecta = parseLocalDate(data.fecha_vencimiento);
        const dataParsed = {
          ...data,
          fecha_vencimiento: fechaCorrecta,
        };
        await updateSalida(salida._id, dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error actualizando salida:", err);
      }
    } else {
      try {
        const fechaCorrecta = parseLocalDate(data.fecha_vencimiento);
        const dataParsed = {
          ...data,
          fecha_vencimiento: fechaCorrecta,
        };
        await createSalida(dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error creando salida:", err);
      }
    }
  });

  useEffect(() => {
    if (salida) {
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
        ...salida,
        producto: salida.producto?._id || salida.producto,
        fecha_vencimiento: formatDateForInput(salida.fecha_vencimiento),
      });
    }
  }, [salida]);

  return (
    <div className="bg-white w-full p-5 rounded-md">
      <form onSubmit={onSubmit}>
        <select
          {...register("producto", { required: true })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
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
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2"
          {...register("cantidad", { required: true, valueAsNumber: true })}
        />
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-amber-300  text-zinc-800 px-4 py-2 mt-5 rounded-md hover:bg-yellow-300 hover:text-black my-2"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalidaFormPage;
