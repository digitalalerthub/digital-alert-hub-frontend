import { useState, useEffect } from 'react';
import { getProfile } from '../../services/profileService';
import ProfileInfo from '../../components/Profile/ProfileInfo';
import EditProfileForm from '../../components/Profile/EditProfileForm';
import DeleteAccount from '../../components/Profile/DeleteAccount';
import { toast } from 'react-toastify';
import type { User } from '../../types/User';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setUser(data);
        } catch {
            toast.error('Error al cargar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className='text-center mt-5'>
                <div className='spinner-border' />
            </div>
        );
    }

    if (!user) {
        return (
            <div className='alert alert-danger'>
                No se pudo cargar el perfil
            </div>
        );
    }

    return (
        !isEditing ? (
            <ProfileInfo user={user} onEdit={() => setIsEditing(true)}>
                <DeleteAccount />
            </ProfileInfo>
        ) : (
            <EditProfileForm
                user={user}
                onSave={(updatedUser) => {
                    setUser(updatedUser);
                    setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
            />
        )
    );
}
