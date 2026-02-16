import * as Yup from "yup";

export const salidaItemSchema = Yup.object().shape({
  producto: Yup.string()
    .required("Seleccione un producto"),

  cantidad: Yup.number()
    .typeError("Digite un número válido")
    .integer("Debe ser entero")
    .positive("Debe ser mayor a cero")
    .required("Cantidad obligatoria"),
});
