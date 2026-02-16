import * as Yup from "yup";

export const compraItemSchema = Yup.object().shape({
  producto: Yup.string().required("Seleccione un producto"),

  cantidad: Yup.number()
    .typeError("Digite un número válido")
    .integer("Debe ser entero")
    .positive("Debe ser mayor a cero")
    .required("Cantidad obligatoria"),

  precio_compra: Yup.number()
    .typeError("Digite un número válido")
    .positive("Debe ser mayor a cero")
    .required("Precio de compra obligatorio"),

  fecha_vencimiento: Yup.date()
    .required("Seleccione una fecha de vencimiento")
    .typeError("La fecha no es válida"),
});
