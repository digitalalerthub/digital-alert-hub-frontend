import { useState, useEffect } from "react";
import { getProfile } from "../services/profileService";
import ProfileInfo from "../components/Profile/ProfileInfo";
import EditProfileForm from "../components/Profile/EditProfileForm";
import ChangePasswordForm from "../components/Profile/ChangePasswordForm";
import DeleteAccount from "../components/Profile/DeleteAccount";
import { toast } from "react-toastify";
import type { User } from "../types/User";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch {
      toast.error("Error al cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" />
      </div>
    );
  }

  if (!user) {
    return <div className="alert alert-danger">No se pudo cargar el perfil</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {!isEditing && !showChangePassword && (
            <ProfileInfo
              user={user}
              onEdit={() => setIsEditing(true)}
              onChangePassword={() => setShowChangePassword(true)}
            >
              {/* 👇 AQUÍ VA EL BORRAR CUENTA */}
              <DeleteAccount />
            </ProfileInfo>
          )}

          {isEditing && (
            <EditProfileForm
              user={user}
              onSave={(updatedUser) => {
                setUser(updatedUser);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
              onChangePassword={() => {
                setIsEditing(false);
                setShowChangePassword(true);
              }}
            />
          )}

          {showChangePassword && (
            <>
              <ChangePasswordForm
                onSuccess={() => setShowChangePassword(false)}
              />
              <div className="text-center mt-3">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="btn btn-link"
                >
                  ← Volver al perfil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
