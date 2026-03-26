import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import ResetPasswordPage from './ResetPasswordPage';

const mockedNavigate = vi.fn();

vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>(
        'react-router-dom',
    );

    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

const renderResetPasswordPage = (initialEntry: string) =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path='/reset-password/:token'
                    element={<ResetPasswordPage />}
                />
            </Routes>
        </MemoryRouter>,
    );

describe('ResetPasswordPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('muestra errores y no envia si la contrasena es invalida', async () => {
        const user = userEvent.setup();

        renderResetPasswordPage('/reset-password/token123?mode=activation');

        await user.type(
            screen.getByPlaceholderText('Nueva Contrasena'),
            '12345678',
        );
        await user.type(
            screen.getByPlaceholderText('Confirma la nueva contrasena'),
            '12345678',
        );
        await user.click(
            screen.getByRole('button', { name: 'Activar cuenta' }),
        );

        expect(
            screen.getByText(
                'La contrasena debe tener minimo 8 caracteres e incluir letras y numeros.',
            ),
        ).toBeTruthy();
        expect(api.post).not.toHaveBeenCalled();
    });

    it('envia la nueva contrasena cuando el formulario es valido', async () => {
        const user = userEvent.setup();
        vi.mocked(api.post).mockResolvedValue({ data: {} });

        renderResetPasswordPage('/reset-password/token123');

        await user.type(
            screen.getByPlaceholderText('Nueva Contrasena'),
            'Clave1234',
        );
        await user.type(
            screen.getByPlaceholderText('Confirma la nueva contrasena'),
            'Clave1234',
        );
        await user.click(
            screen.getByRole('button', { name: 'Cambiar contrasena' }),
        );

        expect(api.post).toHaveBeenCalledWith('/auth/reset-password/token123', {
            nuevaContrasena: 'Clave1234',
        });
        expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
});
