import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getProfile } from '../../services/profileService';
import '../Admin/AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [nombre, setNombre] = useState('');
    const rol = user?.rol;

    useEffect(() => {
        getProfile().then((u) => setNombre(u.nombre));
    }, []);

    return (
        <div className='panel-admin'>
            <div className='container py-5 '>
                <h1 className='display-4 mb-4'>Bienvenido {nombre} 👋</h1>

                <div className='row g-4'>
                    {/* Solo Admin */}
                    {rol === 1 && (
                        <div className='col-lg-4'>
                            <div
                                className='card shadow h-100'
                                onClick={() => navigate('/admin/users')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className='card-body text-center p-5'>
                                    <i className='bi bi-people fs-1 text-primary mb-3'></i>
                                    <h3 className='fw-bold text-primary'>
                                        Usuarios
                                    </h3>
                                    <p className='text-muted'>
                                        Gestionar usuarios
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Solo Admin */}
                    {rol === 1 && (
                        <div className='col-lg-4'>
                            <div
                                className='card shadow h-100'
                                onClick={() => navigate('/admin/roles')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className='card-body text-center p-5'>
                                    <i className='bi bi-shield-check fs-1 text-warning mb-3'></i>
                                    <h3 className='fw-bold text-warning'>
                                        Roles
                                    </h3>
                                    <p className='text-muted'>
                                        Gestionar roles
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin, Ciudadano y JAC */}
                    <div className='col-lg-4'>
                        <div
                            className='card shadow h-100'
                            onClick={() => navigate('/crear-alertas')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className='card-body text-center p-5'>
                                <i className='bi bi-plus-circle fs-1 text-success mb-3'></i>
                                <h3 className='fw-bold text-success'>
                                    Crear Alertas
                                </h3>
                                <p className='text-muted'>
                                    Nueva alerta del sistema
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Tarjeta Panel JAC — solo Admin (1) y JAC (3) */}
                    {(rol === 1 || rol === 3) && (
                        <div className='col-lg-4'>
                            <div
                                className='card shadow h-100'
                                onClick={() => navigate('/jac/alertas')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className='card-body text-center p-5'>
                                    <i className='bi bi-people-fill fs-1 text-danger'></i>
                                    <h3 className='fw-bold text-danger'>
                                        Panel JAC
                                    </h3>
                                    <p className='text-muted'>
                                        Gestión Comunitaria
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Tarjeta Power BI */}
                    <div className='col-lg-4'>
                        <div
                            className='card shadow h-100'
                            onClick={() => navigate('/reportes')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className='card-body text-center p-5'>
                                <i className='bi bi-bar-chart fs-1 text-info mb-3'></i>
                                <h3 className='fw-bold text-info'>Power BI</h3>
                                <p className='text-muted'>Reportes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
