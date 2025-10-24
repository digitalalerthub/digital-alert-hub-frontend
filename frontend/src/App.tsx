// Envuelve toda la aplicación  dentro de AuthProvider lo que permite que cualquier componente acceda al estado global de autenticación.

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Manejo de rutas
import { ToastContainer } from "react-toastify"; // Notificaciones
import "react-toastify/dist/ReactToastify.css"; // Importante para estilos del toast
import "./App.css";

// Importación de las páginas que se van a renderizar
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

// Importación componentes
import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";

// Contexto global de autenticación, cualquier componente dentro de la app pueda usar useAuth()
import { AuthProvider } from "./context/AuthProvider";

// Componente principal de la aplicación
function App() {
  return (
    // Esto permite compartir el estado "isLoggedIn" y las funciones login/logout
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protegidas  El componente PrivateRoute verifica si hay sesión activa, Si sí: renderiza DashboardPage. si no renderiza al login */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
