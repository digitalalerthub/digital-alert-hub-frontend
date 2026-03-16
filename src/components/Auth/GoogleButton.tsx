const GoogleButton = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  return (
    <button
      type="button"
      className="btn btn-light w-100"
      onClick={() => {
        window.location.href = `${apiUrl}/auth/google`;
      }}
    >
      <i className="bi bi-google me-2"></i>
      Iniciar sesion con Google
    </button>
  );
};

export default GoogleButton;
