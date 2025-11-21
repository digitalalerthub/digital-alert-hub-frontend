// Botón para eliminar la cuenta (usa el servicio deleteAccount).

import { useState } from "react";
import { deleteAccount } from "../../services/profileService"; // Función que llama al backend
import { toast } from "react-toastify"; // Para notificaciones

export default function DeleteAccount() {
  // Estado para controlar la visibilidad del modal
  const [showModal, setShowModal] = useState(false);

  // Acción que se ejecuta cuando el usuario confirma la eliminación
  const handleDelete = async () => {
    setShowModal(false); // Cierra el modal

    try {
      const res = await deleteAccount(); // Llama al backend
      if (res.success) {
        toast.success("Cuenta eliminada correctamente.", { autoClose: 3000 });
        // Aquí puedes redirigir al login, por ejemplo:
        // navigate("/login");
      }
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
      toast.error("Ocurrió un error al eliminar la cuenta.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      {/* Botón principal que abre el modal */}
      <div className="text-center mt-3">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-danger px-2"
          style={{ borderRadius: "8px", width: "108px", fontSize: "0.80rem" }}
        >
          Eliminar cuenta
        </button>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Encabezado del modal */}
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">⚠️ Confirmación de Eliminación</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Cerrar"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {/* Cuerpo del modal */}
              <div className="modal-body">
                <p>
                  <strong>
                    ¿Estás seguro de que quieres eliminar tu cuenta? 
                  </strong>
                  &nbsp;Esta acción es permanente y no se puede deshacer.
                </p>
              </div>

              {/* Botones del modal */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "75px", fontSize: "0.80rem" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: "131px", fontSize: "0.80rem" }}
                  onClick={handleDelete}
                >
                  Sí, Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
