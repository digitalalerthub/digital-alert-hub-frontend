import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import ChangePasswordForm from '../../components/Profile/ChangePasswordForm';

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleSuccess = () => {
        logout();
        navigate('/login');
    };

    return (
        <ChangePasswordForm
            onSuccess={handleSuccess}
            onCancel={() => navigate('/perfil')}
        />
    );
}
