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
import ProfilePage from './pages/Profile/ProfilePage';
import ChangePasswordPage from './pages/Profile/ChangePasswordPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import Callback from './pages/Auth/Callback';
import CreateAlertPage from './pages/Alert/CreateAlertPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserTable from './components/Admin/UserTable';
import RoleTable from './components/Admin/RoleTable';
import RoleRoute from './components/Route/RoleRoute';
import JACAlertPanel from './pages/Jac/JACAlertPanel';

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

                    {/* RUTAS PROTEGIDAS GENERALES */}
                    <Route element={<PrivateRoute />}>
                        <Route path='/admin' element={<AdminDashboard />} />
                        <Route
                            path='/crear-alertas'
                            element={<CreateAlertPage />}
                        />
                        <Route path='/perfil' element={<ProfilePage />} />
                        <Route
                            path='/perfil/cambiar-contrasena'
                            element={<ChangePasswordPage />}
                        />
                    </Route>

                    {/*RUTAS DE ADMIN*/}
                    <Route element={<RoleRoute allowedRoles={[1]} />}>
                        <Route path='/admin/users' element={<UserTable />} />
                        <Route path='/admin/roles' element={<RoleTable />} />
                    </Route>

                    {/* RUTAS JAC + ADMIN */}
                    <Route element={<RoleRoute allowedRoles={[1, 3]} />}>
                        <Route
                            path='/jac/alertas'
                            element={<JACAlertPanel />}
                        />
                    </Route>
                </Routes>
                <ToastContainer position='top-right' autoClose={3000} />
            </Router>
        </AuthProvider>
    );
}

export default App;
