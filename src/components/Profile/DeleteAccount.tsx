import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../../services/profileService";
import { toast } from "react-toastify";

export default function DeleteAccount() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const res = await deleteAccount();

      if (res.success) {
        toast.success("Cuenta desactivada correctamente", { autoClose: 2000 });

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          navigate("/login");
          window.location.reload();
        }, 2000);
      }
    } catch {
      toast.error("Ocurrió un error al desactivar la cuenta");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Botón eliminar cuenta */}
      <div className="d-flex justify-content-center mt-3">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-outline-danger btn-sm px-3"
        >
          <i className="bi bi-trash me-1" />
          Eliminar cuenta
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 shadow">

                {/* Header */}
                <div className="modal-header bg-warning-subtle">
                  <h5 className="modal-title d-flex align-items-center gap-2 text-warning">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    ¿Estás seguro?
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                  />
                </div>

                {/* Body */}
                <div className="modal-body">
                  <p className="fw-semibold mb-2">
                    Esta acción{" "}
                    <span className="text-danger">
                      desactivará tu cuenta de forma permanente
                    </span>.
                  </p>

                  <div className="alert alert-warning d-flex gap-2 mb-0">
                    <i className="bi bi-info-circle-fill mt-1"></i>
                    <small>
                      Tu sesión se cerrará inmediatamente y deberás contactar al
                      administrador para solicitar la reactivación de tu cuenta.
                    </small>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Desactivando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-1 text-white" />
                        Sí, desactivar cuenta
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop show"></div>
        </>
      )}
    </>
  );
}
