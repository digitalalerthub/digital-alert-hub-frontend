// Esta será la página protegida que se ve solo si el usuario está logueado

import React from "react";

const ProfilePage: React.FC = () => {
  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center text-white">
        <h1>Actualiza tus datos</h1>
        <p>Solo los usuarios autenticados pueden ver esta página.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
