function Tooltip({ text }) {
  return (
    <span className="relative inline-block group">
      {/* Icono ? */}
      <span
        className="
            ml-1 inline-flex h-4 w-4 items-center justify-center 
            rounded-full border border-gray-400 
            text-[10px] font-bold text-gray-500 
            cursor-default
          "
      >
        ?
      </span>

      {/* Mensaje flotante */}
      <span
        className="
            pointer-events-none
            absolute left-1/2 bottom-full z-20
            hidden w-48 -translate-x-1/2 translate-y-1
            rounded-md bg-gray-800 px-2 py-1
            text-xs text-white shadow-lg
            group-hover:block
          "
      >
        {text}
      </span>
    </span>
  );
}

export default Tooltip;