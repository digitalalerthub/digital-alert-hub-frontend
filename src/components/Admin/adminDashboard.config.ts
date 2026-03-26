export type AdminDashboardCard = {
    key: string;
    title: string;
    description: string;
    route: string;
    iconClassName: string;
    color: string;
    visible: boolean;
};

export const buildAdminDashboardCards = ({
    isAdmin,
    canManageJacAlerts,
}: {
    isAdmin: boolean;
    canManageJacAlerts: boolean;
}): AdminDashboardCard[] => [
    {
        key: 'users',
        title: 'Usuarios',
        description: 'Gestionar usuarios',
        route: '/admin/users',
        iconClassName: 'bi bi-people fs-1 text-primary mb-3',
        color: '#0d6efd',
        visible: isAdmin,
    },
    {
        key: 'roles',
        title: 'Roles',
        description: 'Gestionar roles',
        route: '/admin/roles',
        iconClassName: 'bi bi-shield-check fs-1 text-warning mb-3',
        color: '#ffc107',
        visible: isAdmin,
    },
    {
        key: 'alerts',
        title: 'Crear Alertas',
        description: 'Nueva alerta del sistema',
        route: '/crear-alertas',
        iconClassName: 'bi bi-plus-circle fs-1 text-success mb-3',
        color: '#198754',
        visible: true,
    },
    {
        key: 'jac',
        title: 'Panel JAC',
        description: 'Gestion comunitaria',
        route: '/jac/alertas',
        iconClassName: 'bi bi-people-fill fs-1 text-danger',
        color: '#dc3545',
        visible: canManageJacAlerts,
    },
    {
        key: 'reports',
        title: 'Reportes',
        description: 'Metricas e indicadores',
        route: '/reportes',
        iconClassName: 'bi bi-bar-chart fs-1 text-info mb-3',
        color: '#0dcaf0',
        visible: true,
    },
];
