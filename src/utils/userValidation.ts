export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]{2,100}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{7,15}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const validateName = (
    value: string,
    fieldLabel: 'nombre' | 'apellido',
): string | null => {
    if (!NAME_REGEX.test(value.trim())) {
        return `El ${fieldLabel} solo puede contener letras, espacios, apostrofes o guiones, y debe tener al menos 2 caracteres.`;
    }

    return null;
};

export const validateEmail = (value: string): string | null => {
    if (!EMAIL_REGEX.test(value.trim().toLowerCase())) {
        return 'Ingresa un correo electronico con formato valido.';
    }

    return null;
};

export const validatePhone = (
    value: string,
    options?: { required?: boolean },
): string | null => {
    const normalizedValue = value.trim();
    const required = options?.required ?? false;

    if (!normalizedValue) {
        return required
            ? 'El telefono debe tener solo numeros y entre 7 y 15 digitos.'
            : null;
    }

    if (!PHONE_REGEX.test(normalizedValue)) {
        return 'El telefono debe tener solo numeros y entre 7 y 15 digitos.';
    }

    return null;
};

export const validatePassword = (value: string): string | null => {
    if (!PASSWORD_REGEX.test(value.trim())) {
        return 'La contrasena debe tener minimo 8 caracteres e incluir letras y numeros.';
    }

    return null;
};
