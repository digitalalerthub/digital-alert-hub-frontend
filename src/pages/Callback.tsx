import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      // Guardar token en localStorage
      localStorage.setItem("token", token);
      
      // Redirigir al dashboard usando navigate
      navigate("/dashboard", { replace: true });
    } else {
      // Si no hay token, redirigir al login
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]); // ⚠️ Agregar dependencias

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}>
      <p>Iniciando sesión...</p>
    </div>
  );
}

export default Callback;
