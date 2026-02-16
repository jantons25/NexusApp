import * as yup from "yup";

export const productSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre es obligatorio")
    .min(1, "Debe tener al menos 1 carácter"),
    
  categoria: yup
    .string()
    .required("La categoría es obligatoria")
    .min(1, "Debe seleccionar una categoría"),

  precio_venta: yup
    .number()
    .typeError("El precio debe ser un número")
    .required("El precio de venta es obligatorio")
    .positive("El precio debe ser mayor a 0"),
});
