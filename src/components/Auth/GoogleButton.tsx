const GoogleButton = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  
  return (
    <button
      className="btn btn-light w-100"
      onClick={() => {
        window.location.href = `${API_URL}/auth/google`;
      }}
    >
      <i className="bi bi-google me-2"></i>
      Iniciar sesión con Google
    </button>
  );
};

export default GoogleButton;
