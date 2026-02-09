import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Páginas
import HomePage from "./pages/HomePage";
import QuienesSomosPage from "./pages/QuienesSomosPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactoPage from "./pages/ContactoPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Callback from "./pages/Callback";
import CreateAlertPage from "./pages/CreateAlertPage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserTable from "./components/Admin/UserTable";
import RoleTable from "./components/Admin/RoleTable";

// Componentes
import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";

// Contexto
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/quienes-somos" element={<QuienesSomosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/auth/callback" element={<Callback />} />

          {/* Rutas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <UserTable />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <PrivateRoute>
                <RoleTable />
              </PrivateRoute>
            }
          />
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
