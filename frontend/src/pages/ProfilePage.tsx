// 4. Coordina el flujo de mostrar perfil, editarlo y eliminar cuenta.

import { useState } from "react";
import ProfileInfo from "../components/Profile/ProfileInfo";
import EditProfileForm from "../components/Profile/EditProfileForm";
import DeleteAccount from "../components/Profile/DeleteAccount";
import ChangePasswordForm from "../components/Profile/ChangePasswordForm";
import type { User } from "../types/User";

export default function ProfilePage() {
  // Estado inicial del usuario (podría venir de una API o contexto)
  const [user, setUser] = useState<User>({
    id: 1,
    nombre: "Veronica",
    apellido: "Gómez",
    email: "veronica@gmail.com",
    telefono: "3002071751",
    rol: "Administrador",
  });

  // Estado para alternar entre vista y edición
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Guarda los cambios al editar el perfil
  const handleSave = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false); // Vuelve al modo de visualización
  };

  // Cancela la edición sin guardar
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{
          width: "340px",
          borderRadius: "15px",
          fontSize: "0.9rem",
        }}
      >
        <div className="w-100">
          {/* Si está en modo edición */}
          {isEditing ? (
            <EditProfileForm
              user={user}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <>
              {/* Vista de información del perfil */}
              <ProfileInfo
                user={user}
                onEdit={() => setIsEditing(true)}
                onChangePassword={() => setShowPasswordModal(true)} // Nuevo botón
              />

              {/* Botón eliminar cuenta */}
              <DeleteAccount />
            </>
          )}
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-4 shadow rounded-4"
              style={{ width: "360px", margin: "auto" }}
            >
              <div className="text-center mb-3">
                <i className="bi bi-shield-lock fs-1 text-primary"></i>
              </div>
              <h4 className="text-center fw-bold mb-3">
                Cambiar contraseña
              </h4>

              <ChangePasswordForm
                onSuccess={() => setShowPasswordModal(false)}
              />

              <div className="d-flex justify-content-center mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}