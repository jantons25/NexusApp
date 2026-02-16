import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../css/loginPage.css'

function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signin, errors: singinErrors, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  return (
    <div className="bg w-full h-screen flex justify-center items-center">
      <div className="bg-zinc-800 max-w-md p-10 rounded-md">
        <h1 className="text-2xl text-white font-bold">Iniciar Sesión</h1>
        {singinErrors.map((error, index) => (
          <div key={index} className="text-white bg-red-500 w-full p-2">
            {error}
          </div>
        ))}
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            {...register("username", { required: true })}
            className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          />
          {errors.username && (
            <span className="text-red-500 w-full">Este campo es requerido</span>
          )}
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            {...register("password", { required: true })}
            className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          />
          {errors.password && (
            <span className="text-red-500 w-full">Este campo es requerido</span>
          )}
          <div className="w-full flex justify-center">
            <button
              type="submit"
              className="text-white px-4 py-2 rounded-md border-white border-2 hover:bg-white hover:text-zinc-800 my-2"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
