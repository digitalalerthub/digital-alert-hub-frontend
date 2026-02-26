import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../../services/profileService';
import { toast } from 'react-toastify';
import type { User } from '../../types/User';

interface Props {
    user: User;
    onSave: (data: User) => void;
    onCancel: () => void;
}

export default function EditProfileForm({ user, onSave, onCancel }: Props) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: user.nombre ?? '',
        apellido: user.apellido ?? '',
        telefono: user.telefono ?? '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const updatedUser = await updateProfile(formData);
            toast.success('Perfil actualizado correctamente');
            onSave(updatedUser);
        } catch (error) {
            let message = 'Error al actualizar el perfil';
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as {
                    response?: { data?: { message?: string } };
                };
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='edit-background d-flex justify-content-center align-items-center'>
            <div
                className='card shadow p-4 bg-light bg-opacity-76'
                style={{ width: '370px', borderRadius: '16px' }}
            >
                {/* Avatar y título */}
                <div className='text-center mb-3'>
                    <div
                        className='rounded-circle d-inline-flex align-items-center justify-content-center mb-2'
                        style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#e6f4ff',
                        }}
                    >
                        <i className='bi bi-person-circle text-danger fs-2'></i>
                    </div>
                    <h2 className='fw-bold mb-0' style={{ fontSize: '1.4rem' }}>
                        Editar perfil
                    </h2>
                    <p
                        className='text-muted mb-0'
                        style={{ fontSize: '0.8rem' }}
                    >
                        Actualiza tu información personal
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Nombre */}
                    <div className='mb-3'>
                        <label className='form-label small mb-1'>Nombres</label>
                        <div className='input-group'>
                            <span className='input-group-text'>
                                <i className='bi bi-person'></i>
                            </span>
                            <input
                                type='text'
                                name='nombre'
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className='form-control'
                            />
                        </div>
                    </div>

                    {/* Apellido */}
                    <div className='mb-3'>
                        <label className='form-label small mb-1'>
                            Apellidos
                        </label>
                        <div className='input-group'>
                            <span className='input-group-text'>
                                <i className='bi bi-person-vcard'></i>
                            </span>
                            <input
                                type='text'
                                name='apellido'
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                                className='form-control'
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className='mb-3'>
                        <label className='form-label small mb-1'>
                            Correo electrónico - No Modificable
                        </label>
                        <div className='input-group'>
                            <span className='input-group-text'>
                                <i className='bi bi-envelope'></i>
                            </span>
                            <input
                                type='email'
                                value={user.email}
                                disabled
                                className='form-control bg-light'
                            />
                        </div>
                    </div>

                    {/* Teléfono */}
                    <div className='mb-4'>
                        <label className='form-label small mb-1'>
                            Teléfono
                        </label>
                        <div className='input-group'>
                            <span className='input-group-text'>
                                <i className='bi bi-telephone'></i>
                            </span>
                            <input
                                type='tel'
                                name='telefono'
                                value={formData.telefono}
                                onChange={handleChange}
                                className='form-control'
                                placeholder='Opcional'
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className='d-flex justify-content-center gap-2 mb-3'>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='btn btn-outline-primary btn-sm'
                        >
                            {isLoading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                            type='button'
                            onClick={onCancel}
                            disabled={isLoading}
                            className='btn btn-outline-secondary btn-sm'
                        >
                            Cancelar
                        </button>
                    </div>

                    <div className='d-flex justify-content-center'>
                        <button
                            type='button'
                            onClick={() =>
                                navigate('/perfil/cambiar-contrasena')
                            }
                            className='btn btn-success btn-sm'
                        >
                            Cambiar contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
