import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import rolesService from '../../services/rolesService';
import usersService from '../../services/users';
import UserModal from './UserModal';

vi.mock('../../services/users', () => ({
    default: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        toggleStatus: vi.fn(),
    },
}));

vi.mock('../../services/rolesService', () => ({
    default: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('UserModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(rolesService.getAll).mockResolvedValue([
            { id_rol: 1, nombre_rol: 'Administrador' },
        ]);
    });

    it('cierra el modal desde el boton de cierre', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();

        render(<UserModal user={null} onClose={onClose} onSaved={vi.fn()} />);

        await waitFor(() => {
            expect(rolesService.getAll).toHaveBeenCalled();
        });

        await user.click(screen.getByLabelText('Cerrar modal de usuario'));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('muestra errores de validacion y evita enviar el formulario vacio', async () => {
        const user = userEvent.setup();

        render(<UserModal user={null} onClose={vi.fn()} onSaved={vi.fn()} />);

        await waitFor(() => {
            expect(rolesService.getAll).toHaveBeenCalled();
        });

        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(screen.getByText('El nombre es requerido')).toBeTruthy();
        expect(screen.getByText('El apellido es requerido')).toBeTruthy();
        expect(screen.getByText('El email es requerido')).toBeTruthy();
        expect(screen.getByText('Debe seleccionar un rol')).toBeTruthy();
        expect(usersService.create).not.toHaveBeenCalled();
    });
});
