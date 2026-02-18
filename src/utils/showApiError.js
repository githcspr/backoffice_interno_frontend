import Swal from "sweetalert2";

export function showApiError(error) {
  if (!error) return;

  const status = error.status;
  const data = error.data;

  // VALIDACIONES
  if (status === 400 && data?.code === "VALIDATION_ERROR") {
    const fields = data.fields || {};

    const html = Object.entries(fields)
      .map(([field, msg]) => `<b>${field}</b>: ${msg}`)
      .join("<br/>");

    Swal.fire({
      icon: "error",
      title: "Campos inválidos",
      html,
      confirmButtonText: "Entendido",
    });
    return;
  }

  // CREDENCIALES INVÁLIDAS
  if (status === 401 && data?.code === "INVALID_CREDENTIALS") {
    Swal.fire({
      icon: "warning",
      title: "Credenciales incorrectas",
      text: data.message || "Email o contraseña incorrectos",
      confirmButtonText: "Reintentar",
    });
    return;
  }

  // ERROR GENÉRICO
  Swal.fire({
    icon: "error",
    title: "Error",
    text: error.message || "Ocurrió un error inesperado",
  });
}
