import type { User } from '../../types/User';
import {
    validateEmail,
    validateName,
    validatePhone,
} from '../../utils/userValidation';

export type UserModalFormState = {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    id_rol: string;
};

export const buildUserModalFormState = (
    user: User | null,
): UserModalFormState => {
    if (!user) {
        return {
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            id_rol: '',
        };
    }

    return {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || '',
        id_rol: String(user.id_rol),
    };
};

export const validateUserModalForm = (
    form: UserModalFormState,
    isEditing: boolean,
) => {
    const errors: Record<string, string> = {};
    const nombreError = validateName(form.nombre, 'nombre');
    const apellidoError = validateName(form.apellido, 'apellido');
    const telefonoError = validatePhone(form.telefono);

    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido';
    else if (nombreError) errors.nombre = nombreError;

    if (!form.apellido.trim()) {
        errors.apellido = 'El apellido es requerido';
    } else if (apellidoError) {
        errors.apellido = apellidoError;
    }

    if (!form.email.trim()) {
        errors.email = 'El email es requerido';
    } else if (!isEditing) {
        const emailError = validateEmail(form.email);
        if (emailError) errors.email = emailError;
    }

    if (telefonoError) errors.telefono = telefonoError;
    if (!form.id_rol) errors.id_rol = 'Debe seleccionar un rol';

    return errors;
};
