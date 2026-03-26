import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/admin', { replace: true });
            return;
        }

        navigate('/', { replace: true });
    }, [navigate, searchParams]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <p>Iniciando sesion...</p>
        </div>
    );
}

export default Callback;
