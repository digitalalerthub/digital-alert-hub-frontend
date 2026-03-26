import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import usersService from '../../services/users';
import rolesService, { type Rol } from '../../services/rolesService';
import './UserModal.css';

import type {
    CreateUserPayload,
    UpdateUserPayload,
    User,
} from '../../types/User';
import {
    buildUserModalFormState,
    validateUserModalForm,
} from './userModal.utils';

interface Props {
    user: User | null;
    onClose: () => void;
    onSaved: () => void;
}

const UserModal = ({ user, onClose, onSaved }: Props) => {
    const isEditing = Boolean(user);
    const [form, setForm] = useState(buildUserModalFormState(user));
    const [roles, setRoles] = useState<Rol[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await rolesService.getAll();
                setRoles(data);
            } catch {
                toast.error('No se pudieron cargar los roles');
            }
        };

        void fetchRoles();
    }, []);

    useEffect(() => {
        setForm(buildUserModalFormState(user));
    }, [user]);

    const handleFieldChange = (name: string, value: string) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((current) => ({ ...current, [name]: '' }));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        handleFieldChange(name, value);
    };

    const validateForm = () => {
        const nextErrors = validateUserModalForm(form, isEditing);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);

        try {
            if (isEditing && user) {
                const payload: UpdateUserPayload = {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    telefono: form.telefono.trim(),
                    id_rol: Number(form.id_rol),
                };

                await usersService.update(user.id_usuario, payload);
                toast.success('Usuario actualizado correctamente');
            } else {
                const payload: CreateUserPayload = {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    email: form.email.trim().toLowerCase(),
                    telefono: form.telefono.trim(),
                    id_rol: Number(form.id_rol),
                };

                await usersService.create(payload);
                toast.success(
                    'Usuario creado. Se envio un correo para activar la cuenta y definir la contrasena.',
                );
            }

            onSaved();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        'No se pudo guardar el usuario',
                );
            } else {
                toast.error('Error inesperado al guardar el usuario');
            }
        } finally {
            setSaving(false);
        }
    };

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <>
            <div className='modal-backdrop-custom' onClick={onClose} />

            <div className='modal-container'>
                <div
                    className='modal-content shadow-lg modal-content-custom'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='user-modal-title'
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='modal-header modal-header-custom'>
                        <div className='modal-header-copy'>
                            <h5
                                id='user-modal-title'
                                className='modal-title modal-title-custom'
                            >
                                {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
                            </h5>
                            <p className='modal-subtitle'>
                                {isEditing
                                    ? 'Actualiza la informacion del usuario'
                                    : 'Se enviara un correo para activar la cuenta y crear la contrasena'}
                            </p>
                        </div>
                        <button
                            type='button'
                            className='modal-close-btn'
                            aria-label='Cerrar modal de usuario'
                            onClick={onClose}
                        >
                            <span aria-hidden='true' className='modal-close-icon'>
                                ×
                            </span>
                        </button>
                    </div>

                    <div className='modal-body modal-body-custom'>
                        <div className='row g-4'>
                            <div className='col-md-6'>
                                <label className='form-label form-label-custom'>
                                    Nombre{' '}
                                    <span className='required-asterisk'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='nombre'
                                    className={`form-control form-input-custom ${
                                        errors.nombre ? 'is-invalid' : ''
                                    }`}
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder='Ingresa el nombre'
                                    minLength={2}
                                    maxLength={100}
                                />
                                {errors.nombre && (
                                    <div className='invalid-feedback d-block'>
                                        {errors.nombre}
                                    </div>
                                )}
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label form-label-custom'>
                                    Apellido{' '}
                                    <span className='required-asterisk'>*</span>
                                </label>
                                <input
                                    type='text'
                                    name='apellido'
                                    className={`form-control form-input-custom ${
                                        errors.apellido ? 'is-invalid' : ''
                                    }`}
                                    value={form.apellido}
                                    onChange={handleChange}
                                    placeholder='Ingresa el apellido'
                                    minLength={2}
                                    maxLength={100}
                                />
                                {errors.apellido && (
                                    <div className='invalid-feedback d-block'>
                                        {errors.apellido}
                                    </div>
                                )}
                            </div>

                            <div className='col-md-7'>
                                <label className='form-label form-label-custom'>
                                    Email{' '}
                                    <span className='required-asterisk'>*</span>
                                </label>
                                <input
                                    type='email'
                                    name='email'
                                    className={`form-control form-input-custom ${
                                        errors.email ? 'is-invalid' : ''
                                    } ${isEditing ? 'input-disabled' : ''}`}
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={isEditing}
                                    placeholder='ejemplo@correo.com'
                                    autoComplete='email'
                                />
                                {errors.email && (
                                    <div className='invalid-feedback d-block'>
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className='col-md-5'>
                                <label className='form-label form-label-custom'>
                                    Telefono
                                </label>
                                <input
                                    type='text'
                                    name='telefono'
                                    className={`form-control form-input-custom ${
                                        errors.telefono ? 'is-invalid' : ''
                                    }`}
                                    value={form.telefono}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            'telefono',
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 15),
                                        )
                                    }
                                    placeholder='3001234567'
                                    inputMode='numeric'
                                    minLength={7}
                                    maxLength={15}
                                />
                                {errors.telefono && (
                                    <div className='invalid-feedback d-block'>
                                        {errors.telefono}
                                    </div>
                                )}
                            </div>

                            <div className='col-12'>
                                <label className='form-label form-label-custom'>
                                    Rol{' '}
                                    <span className='required-asterisk'>*</span>
                                </label>
                                <select
                                    name='id_rol'
                                    className={`form-select form-input-custom ${
                                        errors.id_rol ? 'is-invalid' : ''
                                    }`}
                                    value={form.id_rol}
                                    onChange={handleChange}
                                >
                                    <option value=''>Seleccione un rol</option>
                                    {roles.map((rol) => (
                                        <option
                                            key={rol.id_rol}
                                            value={rol.id_rol}
                                        >
                                            {rol.nombre_rol}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_rol && (
                                    <div className='invalid-feedback d-block'>
                                        {errors.id_rol}
                                    </div>
                                )}
                            </div>

                            {!isEditing && (
                                <div className='col-12'>
                                    <div className='alert alert-info mb-0'>
                                        El usuario recibira un correo para
                                        activar la cuenta y definir su
                                        contrasena.
                                    </div>
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
                                <>Guardar</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
};

export default UserModal;
