import { useForm } from "react-hook-form";
import { useRelevo } from "../context/RelevoContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function RelevosFormPage({
  closeModal,
  refreshPagina,
  relevo,
  products,
  user,
  users,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();
  const { createRelevo, updateRelevo } = useRelevo();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    if (relevo && relevo._id) {
      try {
        const dataParsed = {
          ...data,
          recepcionista: user.username,
        }
        await updateRelevos(relevo._id, dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error actualizando relevos:", err);
      }
    } else {
      try {
        const dataParsed = {
            ...data,
            recepcionista: user.username,
          }
        await createRelevos(dataParsed);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error creando relevos:", err);
      }
    }
  });

  useEffect(() => {
    if (relevo) {
      reset({
        ...relevo,
        producto: relevo.producto?._id || relevo.producto,
      });
    }
  }, [relevo]);

  return (
    <div className="bg-zinc-800 max-w-md p-10 rounded-md">
      <form onSubmit={onSubmit}>
        <select
          {...register("responsable", { required: true })}
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
        >
          <option value="">Selecciona un resposable</option>
          {users.map((resp) => (
            <option key={resp._id} value={resp.username}>
              {resp.username}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Observación"
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          {...register("observacion", { required: true })}
        />
        <input
          type="text"
          placeholder="Conformidad"
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          {...register("conformidad", { required: true })}
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

export default RelevosFormPage;
