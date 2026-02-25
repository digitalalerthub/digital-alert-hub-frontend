import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Páginas
import HomePage from './pages/Home/HomePage';
import QuienesSomosPage from './pages/Home/QuienesSomosPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ContactoPage from './pages/Contact/ContactPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import Callback from './pages/Auth/Callback';
import CreateAlertPage from './pages/Alert/CreateAlertPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserTable from './components/Admin/UserTable';
import RoleTable from './components/Admin/RoleTable';

// Componentes
import NavBar from './components/Layout/NavBar';
import PrivateRoute from './components/Route/PrivateRoute';

// Contexto
import { AuthProvider } from './context/AuthProvider';

function App() {
    return (
        <AuthProvider>
            <Router>
                <NavBar />
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path='/' element={<HomePage />} />
                    <Route
                        path='/quienes-somos'
                        element={<QuienesSomosPage />}
                    />
                    <Route path='/contacto' element={<ContactoPage />} />
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                    <Route
                        path='/forgot-password'
                        element={<ForgotPasswordPage />}
                    />
                    <Route
                        path='/reset-password/:token'
                        element={<ResetPasswordPage />}
                    />
                    <Route path='/auth/callback' element={<Callback />} />

                    {/* Rutas Protegidas */}
                    <Route
                        path='/admin'
                        element={
                            <PrivateRoute>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path='/admin/users'
                        element={
                            <PrivateRoute>
                                <UserTable />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path='/admin/roles'
                        element={
                            <PrivateRoute>
                                <RoleTable />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path='/crear-alertas'
                        element={
                            <PrivateRoute>
                                <CreateAlertPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path='/perfil'
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />
                </Routes>
                <ToastContainer position='top-right' autoClose={3000} />
            </Router>
        </AuthProvider>
    );
}

export default App;
