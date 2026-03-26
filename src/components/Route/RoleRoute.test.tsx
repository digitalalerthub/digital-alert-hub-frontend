import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../context/useAuth';
import RoleRoute from './RoleRoute';

vi.mock('../../context/useAuth', () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const renderRoleRoute = () =>
    render(
        <MemoryRouter initialEntries={['/admin/users']}>
            <Routes>
                <Route element={<RoleRoute allowedRoles={['administrador']} />}>
                    <Route
                        path='/admin/users'
                        element={<div>Ruta protegida</div>}
                    />
                </Route>
                <Route path='/' element={<div>Inicio</div>} />
                <Route path='/admin' element={<div>Panel admin</div>} />
            </Routes>
        </MemoryRouter>,
    );

describe('RoleRoute', () => {
    beforeEach(() => {
        mockedUseAuth.mockReset();
    });

    it('permite el acceso cuando el rol es valido', () => {
        mockedUseAuth.mockReturnValue({
            isLoggedIn: true,
            isLoading: false,
            user: {
                id: 1,
                email: 'admin@test.com',
                rol: 1,
                role_name: 'administrador',
                exp: 9999999999,
            },
            isAdmin: true,
            token: 'token',
            login: vi.fn(),
            logout: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Ruta protegida')).toBeTruthy();
    });

    it('redirige al inicio si no hay sesion', () => {
        mockedUseAuth.mockReturnValue({
            isLoggedIn: false,
            isLoading: false,
            user: null,
            isAdmin: false,
            token: null,
            login: vi.fn(),
            logout: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Inicio')).toBeTruthy();
    });

    it('redirige al panel admin si el rol no esta autorizado', () => {
        mockedUseAuth.mockReturnValue({
            isLoggedIn: true,
            isLoading: false,
            user: {
                id: 2,
                email: 'ciudadano@test.com',
                rol: 2,
                role_name: 'ciudadano',
                exp: 9999999999,
            },
            isAdmin: false,
            token: 'token',
            login: vi.fn(),
            logout: vi.fn(),
        });

        renderRoleRoute();

        expect(screen.getByText('Panel admin')).toBeTruthy();
    });
});
