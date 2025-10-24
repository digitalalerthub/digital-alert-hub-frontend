// Envuelve toda la aplicación  dentro de AuthProvider lo que permite que cualquier componente acceda al estado global de autenticación.

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Manejo de rutas
import { ToastContainer } from "react-toastify"; // Notificaciones
import "react-toastify/dist/ReactToastify.css"; // Importante para estilos del toast
import "./App.css";

// Importación de las páginas que se van a renderizar
import HomePage from "./pages/HomePage";
import QuienesSomosPage from "./pages/QuienesSomosPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactoPage from "./pages/ContactoPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

// Importación componentes
import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";

// Contexto global de autenticación, cualquier componente dentro de la app pueda usar useAuth()
import { AuthProvider } from "./context/AuthProvider";
import CreateAlertPage from "./pages/CreateAlertPage";

// Componente principal de la aplicación
function App() {
  return (
    // Esto permite compartir el estado "isLoggedIn" y las funciones login/logout
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/quienes-somos" element={<QuienesSomosPage />} />
          <Route path="contacto" element={<ContactoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Protegidas  El componente PrivateRoute verifica si hay sesión activa, Si sí: renderiza DashboardPage. si no renderiza al login */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />{" "}
          <Route
            path="/crear-alertas"
            element={
              <PrivateRoute>
                <CreateAlertPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <ProfilePage />
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
