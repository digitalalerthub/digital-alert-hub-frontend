import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import usersService from '../../services/users';
import rolesService, { type Rol } from '../../services/rolesService';
import type { User } from '../../types/User';
import UserModal from './UserModal';
import UserStatusConfirmModal from './UserStatusConfirmModal';
import {
    buildVisiblePageNumbers,
    filterUsersBySearch,
    findRoleNameById,
    formatUserCreatedAt,
    getPaginatedUsers,
    ITEMS_PER_PAGE,
} from './userTable.utils';
import './UserTable.css';

const UserTable = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToToggle, setUserToToggle] = useState<User | null>(null);
    const [togglingStatus, setTogglingStatus] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        void loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setErrorMessage(null);

        const [usersResult, rolesResult] = await Promise.allSettled([
            usersService.getAll(),
            rolesService.getAll(),
        ]);

        if (usersResult.status === 'fulfilled') {
            setUsers(usersResult.value);
        } else {
            setUsers([]);
            setErrorMessage(
                'No fue posible consultar la API de usuarios. Verifica que el backend este activo y que tu sesion tenga permisos de administrador.',
            );
        }

        if (rolesResult.status === 'fulfilled') {
            setRoles(rolesResult.value);
        } else {
            setRoles([]);
        }

        setCurrentPage(1);
        setLoading(false);
    };

    const filteredUsers = useMemo(
        () => filterUsersBySearch(users, searchTerm),
        [users, searchTerm],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const requestToggleStatus = (user: User) => {
        setUserToToggle(user);
    };

    const handleToggleCancel = () => {
        if (togglingStatus) return;
        setUserToToggle(null);
    };

    const confirmToggleStatus = async () => {
        if (!userToToggle) return;

        setTogglingStatus(true);

        try {
            await usersService.toggleStatus(
                userToToggle.id_usuario,
                !userToToggle.estado,
            );
            toast.success(
                userToToggle.estado
                    ? 'Usuario inactivado correctamente'
                    : 'Usuario activado correctamente',
            );
            setUserToToggle(null);
            void loadData();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        'No se pudo cambiar el estado del usuario',
                );
            } else {
                toast.error('Error inesperado al cambiar el estado');
            }
        } finally {
            setTogglingStatus(false);
        }
    };

    const openCreate = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleUserSaved = () => {
        setShowModal(false);
        setSelectedUser(null);
        void loadData();
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading) {
        return <div className='text-center mt-5'>Cargando...</div>;
    }

    const { totalPages, startIndex, endIndex, paginatedUsers } =
        getPaginatedUsers(filteredUsers, currentPage, ITEMS_PER_PAGE);
    const visiblePageNumbers = buildVisiblePageNumbers(currentPage, totalPages);

    return (
        <div className='gestion-usuarios'>
            <div className='user-table-container'>
                {showModal && (
                    <UserModal
                        user={selectedUser}
                        onClose={handleModalClose}
                        onSaved={handleUserSaved}
                    />
                )}

                {userToToggle && (
                    <UserStatusConfirmModal
                        user={userToToggle}
                        processing={togglingStatus}
                        onCancel={handleToggleCancel}
                        onConfirm={() => void confirmToggleStatus()}
                    />
                )}

                <Breadcrumb
                    items={[
                        { label: 'Panel Principal', to: '/admin' },
                        { label: 'Gestion de Usuarios' },
                    ]}
                />

                <div className='header-section'>
                    <div className='title-section'>
                        <h2 className='main-title'>Gestion de Usuarios</h2>
                        <p className='subtitle'>
                            Administra y controla los usuarios del sistema
                        </p>
                    </div>
                </div>

                <div className='main-card'>
                    <div className='search-section'>
                        <div className='search-box-wrapper'>
                            <svg
                                className='search-icon-svg'
                                width='20'
                                height='20'
                                viewBox='0 0 20 20'
                                fill='none'
                            >
                                <path
                                    d='M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                />
                            </svg>
                            <input
                                type='text'
                                placeholder='Buscar por nombre o correo...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='search-input'
                            />
                            {searchTerm && (
                                <button
                                    type='button'
                                    onClick={clearSearch}
                                    className='clear-button'
                                >
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 16 16'
                                        fill='currentColor'
                                    >
                                        <path d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5.354 4.646a.5.5 0 1 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z' />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <button
                            type='button'
                            className='create-btn'
                            onClick={openCreate}
                        >
                            <span className='btn-icon'>+</span>
                            Nuevo Usuario
                        </button>
                    </div>

                    {searchTerm && !errorMessage && (
                        <div className='search-results-info'>
                            {filteredUsers.length === 0 ? (
                                <span className='no-results-text'>
                                    No se encontraron usuarios que coincidan con "
                                    {searchTerm}"
                                </span>
                            ) : (
                                <span className='results-found-text'>
                                    {filteredUsers.length} usuario
                                    {filteredUsers.length !== 1 ? 's' : ''}{' '}
                                    encontrado
                                    {filteredUsers.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    )}

                    <div className='table-container'>
                        {paginatedUsers.length === 0 ? (
                            <div className='empty-state'>
                                <div className='empty-icon-wrapper'>
                                    <svg
                                        width='64'
                                        height='64'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1.5'
                                    >
                                        <circle cx='11' cy='11' r='8' />
                                        <path d='m21 21-4.35-4.35' />
                                    </svg>
                                </div>
                                <h3 className='empty-title'>
                                    {errorMessage
                                        ? 'No se pudieron cargar los usuarios'
                                        : searchTerm
                                          ? 'No se encontraron resultados'
                                          : 'No hay usuarios'}
                                </h3>
                                <p className='empty-description'>
                                    {errorMessage
                                        ? errorMessage
                                        : searchTerm
                                          ? 'Intenta con otros terminos de busqueda'
                                          : 'Comienza creando tu primer usuario'}
                                </p>
                            </div>
                        ) : (
                            <table className='user-table'>
                                <thead>
                                    <tr className='thead-row'>
                                        <th className='table-th'>ID</th>
                                        <th className='table-th table-th-left'>
                                            Nombre Completo
                                        </th>
                                        <th className='table-th table-th-left'>
                                            Correo Electronico
                                        </th>
                                        <th className='table-th'>Rol</th>
                                        <th className='table-th'>
                                            Fecha de Creacion
                                        </th>
                                        <th className='table-th'>Estado</th>
                                        <th className='table-th'>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map((user, index) => (
                                        <tr
                                            key={user.id_usuario}
                                            className='table-row'
                                            style={{
                                                animationDelay: `${index * 0.05}s`,
                                            }}
                                        >
                                            <td className='td-id'>
                                                {user.id_usuario}
                                            </td>
                                            <td className='td-name'>
                                                {user.nombre} {user.apellido}
                                            </td>
                                            <td className='td-email'>
                                                {user.email}
                                            </td>
                                            <td className='td-center'>
                                                <span className='role-badge'>
                                                    {findRoleNameById(
                                                        roles,
                                                        user.id_rol,
                                                    )}
                                                </span>
                                            </td>
                                            <td className='td-date'>
                                                {formatUserCreatedAt(
                                                    user.created_at,
                                                )}
                                            </td>
                                            <td className='td-center'>
                                                <span
                                                    className={
                                                        user.estado
                                                            ? 'status-active'
                                                            : 'status-inactive'
                                                    }
                                                >
                                                    <span className='status-dot'></span>
                                                    {user.estado
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className='td-actions'>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    <button
                                                        type='button'
                                                        className='action-btn-edit'
                                                        title='Editar usuario'
                                                        onClick={() =>
                                                            openEdit(user)
                                                        }
                                                    >
                                                        <svg
                                                            width='16'
                                                            height='16'
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            strokeWidth='2'
                                                        >
                                                            <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
                                                            <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={
                                                            user.estado
                                                                ? 'action-btn-deactivate'
                                                                : 'action-btn-activate'
                                                        }
                                                        title={
                                                            user.estado
                                                                ? 'Desactivar usuario'
                                                                : 'Activar usuario'
                                                        }
                                                        onClick={() =>
                                                            requestToggleStatus(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        {user.estado ? (
                                                            <svg
                                                                width='16'
                                                                height='16'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                strokeWidth='2'
                                                            >
                                                                <rect
                                                                    x='3'
                                                                    y='11'
                                                                    width='18'
                                                                    height='11'
                                                                    rx='2'
                                                                    ry='2'
                                                                />
                                                                <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                                                            </svg>
                                                        ) : (
                                                            <svg
                                                                width='16'
                                                                height='16'
                                                                viewBox='0 0 24 24'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                strokeWidth='2'
                                                            >
                                                                <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                                                                <polyline points='22 4 12 14.01 9 11.01' />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {filteredUsers.length > 0 && totalPages > 1 && (
                        <div className='pagination-section'>
                            <div className='pagination-info'>
                                Mostrando{' '}
                                <strong>
                                    {startIndex + 1}-{endIndex}
                                </strong>{' '}
                                de <strong>{filteredUsers.length}</strong>{' '}
                                usuarios
                            </div>
                            <div className='pagination-buttons'>
                                <button
                                    type='button'
                                    className={`pagination-btn ${currentPage === 1 ? 'pagination-btn-disabled' : ''}`}
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.max(page - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                    >
                                        <polyline points='15 18 9 12 15 6' />
                                    </svg>
                                </button>

                                {visiblePageNumbers.map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        type='button'
                                        className={`pagination-btn ${currentPage === pageNum ? 'pagination-btn-active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    type='button'
                                    className={`pagination-btn ${currentPage === totalPages ? 'pagination-btn-disabled' : ''}`}
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(page + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                    >
                                        <polyline points='9 18 15 12 9 6' />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserTable;
