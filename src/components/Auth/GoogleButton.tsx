const GoogleButton = () => {
  return (
    <button
      className="btn btn-light w-100"
      onClick={() => {
        window.location.href = "http://localhost:4000/api/auth/google";
      }}
    >
      <i className="bi bi-google me-2"></i>
      Iniciar sesión con Google
    </button>
  );
};

export default GoogleButton;
