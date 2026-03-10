import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

interface RoleRouteProps {
    allowedRoles: number[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { isLoggedIn, isLoading, user } = useAuth();

    if (isLoading)
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background:
                        'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    gap: '1rem',
                }}
            >
                <img
                    src='/Logo_transparente.png'
                    alt='Logo'
                    width='120'
                    style={{ opacity: 0.9 }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#dc2626',
                                animation: 'bounce 0.6s infinite alternate',
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                    Cargando...
                </p>
                <style>{`
            @keyframes bounce {
                from { transform: translateY(0); opacity: 0.4; }
                to { transform: translateY(-12px); opacity: 1; }
            }
        `}</style>
            </div>
        );

    if (!isLoggedIn || !user) return <Navigate to='/' replace />;

    if (!allowedRoles.includes(user.rol)) {
        return <Navigate to='/admin' replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
