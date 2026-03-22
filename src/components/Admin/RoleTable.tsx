import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import rolesService, { type Rol } from '../../services/rolesService';
import RoleDeleteConfirmModal from './RoleDeleteConfirmModal';
import RoleModal from './RoleModal';
import './RoleTable.css';

const RoleTable = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Rol | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        void loadData();
    }, []);

    const loadData = async () => {
        try {
            const rolesList = await rolesService.getAll();
            setRoles(rolesList);
        } catch {
            toast.error('No se pudieron cargar los roles');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedRole(null);
        setShowModal(true);
    };

    const openEdit = (role: Rol) => {
        setSelectedRole(role);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedRole(null);
    };

    const handleRoleSaved = () => {
        setShowModal(false);
        setSelectedRole(null);
        void loadData();
    };

    const requestDelete = (role: Rol) => {
        const usuariosAsignados = role.usuarios_asignados ?? 0;

        if (usuariosAsignados > 0) {
            toast.info(
                `No puedes eliminar este rol porque tiene ${usuariosAsignados} usuario${usuariosAsignados === 1 ? '' : 's'} asignado${usuariosAsignados === 1 ? '' : 's'}.`,
            );
            return;
        }

        setRoleToDelete(role);
    };

    const handleDeleteCancel = () => {
        if (deleting) return;
        setRoleToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        setDeleting(true);

        try {
            await rolesService.delete(roleToDelete.id_rol);
            toast.success('Rol eliminado correctamente');
            setRoleToDelete(null);
            void loadData();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        'No se pudo eliminar el rol',
                );
            } else {
                toast.error('Error inesperado al eliminar el rol');
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <div className='text-center mt-5'>Cargando...</div>;
    }

    return (
        <div className='roles'>
            <div className='role-table-container'>
                {showModal && (
                    <RoleModal
                        role={selectedRole}
                        onClose={handleModalClose}
                        onSaved={handleRoleSaved}
                    />
                )}

                {roleToDelete && (
                    <RoleDeleteConfirmModal
                        roleName={roleToDelete.nombre_rol}
                        deleting={deleting}
                        onCancel={handleDeleteCancel}
                        onConfirm={() => void handleDeleteConfirm()}
                    />
                )}

                <Breadcrumb
                    items={[
                        { label: 'Panel Principal', to: '/admin' },
                        { label: 'Gestión de Roles' },
                    ]}
                />

                <div className='header-section'>
                    <div className='title-section'>
                        <h1 className='main-title'>Gestión de Roles</h1>
                        <p className='subtitle'>
                            Administra los roles del sistema
                        </p>
                    </div>
                </div>

                <div className='main-card'>
                    <div className='card-header-section'>
                        <div className='header-info'>
                            <h3 className='header-title'>Roles del Sistema</h3>
                            <p className='header-description'>
                                Total de roles: <strong>{roles.length}</strong>
                            </p>
                        </div>
                        <button className='create-btn' onClick={openCreate}>
                            <span className='btn-icon'>+</span>
                            Nuevo Rol
                        </button>
                    </div>

                    {roles.length > 0 ? (
                        <div className='roles-grid'>
                            {roles.map((role, index) => (
                                <div
                                    key={role.id_rol}
                                    className='role-card'
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className='role-card-header'>
                                        <div className='role-icon-wrapper'>
                                            <i className='bi bi-shield-check role-icon' />
                                        </div>
                                        <div className='role-actions'>
                                            <button
                                                className='action-btn-edit'
                                                onClick={() => openEdit(role)}
                                                title='Editar rol'
                                            >
                                                <i className='bi bi-pencil' />
                                            </button>
                                            <button
                                                className='action-btn-delete'
                                                onClick={() => requestDelete(role)}
                                                disabled={
                                                    (role.usuarios_asignados ??
                                                        0) > 0
                                                }
                                                aria-disabled={
                                                    (role.usuarios_asignados ??
                                                        0) > 0
                                                }
                                                title={
                                                    (role.usuarios_asignados ??
                                                        0) > 0
                                                        ? 'No se puede eliminar porque tiene usuarios asignados'
                                                        : 'Eliminar rol'
                                                }
                                            >
                                                <i className='bi bi-trash' />
                                            </button>
                                        </div>
                                    </div>

                                    <div className='role-card-body'>
                                        <h4 className='role-name'>
                                            {role.nombre_rol}
                                        </h4>
                                        <p className='role-usage-text'>
                                            Usuarios asignados:{' '}
                                            <strong>
                                                {role.usuarios_asignados ?? 0}
                                            </strong>
                                        </p>
                                        <p className='role-id-text'>
                                            ID: {role.id_rol}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='empty-state'>
                            <div className='empty-icon-wrapper'>
                                <i
                                    className='bi bi-shield-x'
                                    style={{ fontSize: '4rem' }}
                                />
                            </div>
                            <h3 className='empty-title'>
                                No hay roles registrados
                            </h3>
                            <p className='empty-description'>
                                Comienza creando tu primer rol del sistema
                            </p>
                            <button
                                className='create-btn-empty'
                                onClick={openCreate}
                            >
                                <span className='btn-icon'>+</span>
                                Crear Primer Rol
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleTable;
