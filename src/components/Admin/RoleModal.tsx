import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import rolesService, { type Rol } from '../../services/rolesService';
import './RoleModal.css';

interface Props {
    role: Rol | null;
    onClose: () => void;
    onSaved: () => void;
}

const RoleModal = ({ role, onClose, onSaved }: Props) => {
    const isEditing = Boolean(role);

    const [nombreRol, setNombreRol] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (role) {
            setNombreRol(role.nombre_rol);
        }
    }, [role]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNombreRol(e.target.value);
        if (error) setError('');
    };

    const validateForm = () => {
        if (!nombreRol.trim()) {
            setError('El nombre del rol es requerido');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);

        try {
            if (isEditing) {
                await rolesService.update(role!.id_rol, { nombre_rol: nombreRol });
                toast.success('Rol actualizado correctamente');
            } else {
                await rolesService.create({ nombre_rol: nombreRol });
                toast.success('Rol creado correctamente');
            }

            onSaved();
        } catch (error: unknown) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        'No se pudo guardar el rol',
                );
            } else {
                toast.error('Error inesperado al guardar el rol');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className='modal-backdrop-custom' onClick={onClose} />

            <div className='modal-container'>
                <div className='modal-content shadow-lg modal-content-custom'>
                    <div className='modal-header modal-header-custom'>
                        <div>
                            <h5 className='modal-title modal-title-custom'>
                                {isEditing
                                    ? '\u270F\uFE0F Editar Rol'
                                    : '\u2795 Crear Rol'}
                            </h5>
                            <p className='modal-subtitle'>
                                {isEditing
                                    ? 'Actualiza el nombre del rol'
                                    : 'Ingresa el nombre del nuevo rol'}
                            </p>
                        </div>
                        <button
                            className='btn-close btn-close-white modal-close-btn'
                            onClick={onClose}
                        ></button>
                    </div>

                    <div className='modal-body modal-body-custom'>
                        <div className='mb-3'>
                            <label className='form-label form-label-custom'>
                                Nombre del Rol{' '}
                                <span className='required-asterisk'>*</span>
                            </label>
                            <input
                                type='text'
                                name='nombre_rol'
                                className={`form-control form-input-custom ${
                                    error ? 'is-invalid' : ''
                                }`}
                                value={nombreRol}
                                onChange={handleChange}
                                placeholder='Ej: Administrador, Usuario, Moderador'
                            />
                            {error && (
                                <div className='invalid-feedback d-block'>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='modal-footer modal-footer-custom'>
                        <button
                            className='btn btn-secondary btn-custom'
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            className='btn btn-primary btn-primary-custom'
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span
                                        className='spinner-border spinner-border-sm me-2'
                                        role='status'
                                        aria-hidden='true'
                                    ></span>
                                    Guardando...
                                </>
                            ) : (
                                <>{'\uD83D\uDCBE Guardar'}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RoleModal;
