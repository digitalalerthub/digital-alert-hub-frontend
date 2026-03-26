import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getProfile } from '../../services/profileService';
import {
    getCanonicalRoleName,
    isAdminRole,
    isJacRole,
} from '../../utils/roles';
import { buildAdminDashboardCards } from './adminDashboard.config';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [nombre, setNombre] = useState('');
    const roleName = getCanonicalRoleName(user?.role_name);
    const isAdmin = isAdminRole(roleName);
    const canManageJacAlerts = isAdmin || isJacRole(roleName);
    const cards = useMemo(
        () =>
            buildAdminDashboardCards({
                isAdmin,
                canManageJacAlerts,
            }).filter((card) => card.visible),
        [canManageJacAlerts, isAdmin],
    );

    useEffect(() => {
        getProfile().then((profile) => setNombre(profile.nombre));
    }, []);

    return (
        <div className='panel-admin'>
            <div className='container py-5 '>
                <h1 className='display-4 mb-4'>Bienvenido {nombre}</h1>

                <div className='row g-4'>
                    {cards.map((card) => (
                        <div key={card.key} className='col-lg-4'>
                            <div
                                className='card shadow h-100'
                                onClick={() => navigate(card.route)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className='card-body text-center p-5'>
                                    <i className={card.iconClassName} />
                                    <h3
                                        className='fw-bold panel-admin-card-title'
                                        style={{ color: card.color }}
                                    >
                                        {card.title}
                                    </h3>
                                    <p
                                        className='panel-admin-card-copy'
                                        style={{ color: '#212529' }}
                                    >
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
