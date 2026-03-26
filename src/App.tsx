import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import RoleRoute from './components/Route/RoleRoute';
import NavBar from './components/Layout/NavBar';
import PrivateRoute from './components/Route/PrivateRoute';
import PublicRoute from './components/Route/PublicRoute';
import { AuthProvider } from './context/AuthProvider';
import { AlertCategoriesProvider } from './context/AlertCategoriesProvider';
import { AlertStatesProvider } from './context/AlertStatesProvider';

const HomePage = lazy(() => import('./pages/Home/HomePage'));
const QuienesSomosPage = lazy(() => import('./pages/Home/QuienesSomosPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ContactoPage = lazy(() => import('./pages/Contact/ContactPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const ChangePasswordPage = lazy(
    () => import('./pages/Profile/ChangePasswordPage'),
);
const ForgotPasswordPage = lazy(
    () => import('./pages/Auth/ForgotPasswordPage'),
);
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const Callback = lazy(() => import('./pages/Auth/Callback'));
const CreateAlertPage = lazy(() => import('./pages/Alert/CreateAlertPage'));
const AlertDetailPage = lazy(() => import('./pages/Alert/AlertDetailPage'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const UserTable = lazy(() => import('./components/Admin/UserTable'));
const RoleTable = lazy(() => import('./components/Admin/RoleTable'));
const JACAlertPanel = lazy(() => import('./pages/Jac/JACAlertPanel'));
const ReportesPage = lazy(() => import('./pages/Reportes/ReportesPage'));

const AppRoutesFallback = () => (
    <div className='app-routes-loading'>Cargando modulo...</div>
);

function App() {
    return (
        <AuthProvider>
            <AlertStatesProvider>
                <AlertCategoriesProvider>
                    <Router>
                        <NavBar />
                        <Suspense fallback={<AppRoutesFallback />}>
                            <Routes>
                                <Route element={<PublicRoute />}>
                                    <Route path='/' element={<HomePage />} />
                                    <Route
                                        path='/login'
                                        element={<LoginPage />}
                                    />
                                    <Route
                                        path='/register'
                                        element={<RegisterPage />}
                                    />
                                </Route>
                                <Route
                                    path='/quienes-somos'
                                    element={<QuienesSomosPage />}
                                />
                                <Route
                                    path='/contacto'
                                    element={<ContactoPage />}
                                />
                                <Route
                                    path='/alertas/:id'
                                    element={<AlertDetailPage />}
                                />
                                <Route
                                    path='/forgot-password'
                                    element={<ForgotPasswordPage />}
                                />
                                <Route
                                    path='/reset-password/:token'
                                    element={<ResetPasswordPage />}
                                />
                                <Route
                                    path='/auth/callback'
                                    element={<Callback />}
                                />

                                <Route element={<PrivateRoute />}>
                                    <Route
                                        path='/admin'
                                        element={<AdminDashboard />}
                                    />
                                    <Route
                                        path='/crear-alertas'
                                        element={<CreateAlertPage />}
                                    />
                                    <Route
                                        path='/perfil'
                                        element={<ProfilePage />}
                                    />
                                    <Route
                                        path='/perfil/cambiar-contrasena'
                                        element={<ChangePasswordPage />}
                                    />
                                </Route>

                                <Route
                                    element={
                                        <RoleRoute
                                            allowedRoles={['administrador']}
                                        />
                                    }
                                >
                                    <Route
                                        path='/admin/users'
                                        element={<UserTable />}
                                    />
                                    <Route
                                        path='/admin/roles'
                                        element={<RoleTable />}
                                    />
                                </Route>

                                <Route
                                    element={
                                        <RoleRoute
                                            allowedRoles={[
                                                'administrador',
                                                'ciudadano',
                                                'jac',
                                            ]}
                                        />
                                    }
                                >
                                    <Route
                                        path='/jac/alertas'
                                        element={<JACAlertPanel />}
                                    />
                                    <Route
                                        path='/reportes'
                                        element={<ReportesPage />}
                                    />
                                </Route>
                            </Routes>
                        </Suspense>
                        <ToastContainer position='top-right' autoClose={3000} />
                    </Router>
                </AlertCategoriesProvider>
            </AlertStatesProvider>
        </AuthProvider>
    );
}

export default App;
