<form onSubmit={onSubmit}>
  <input
    type="text"
    name="username"
    placeholder="Usuario"
    {...register("username", { required: true })}
    className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
  />
  <input
    type="password"
    name="password"
    placeholder="Contraseña"
    {...register("password", { required: true })}
    className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
  />
  <button
    type="submit"
    className="text-white px-4 py-2 rounded-md border-white border-2 hover:bg-white hover:text-zinc-800 my-2"
  >
    Registrarse
  </button>
</form>;
