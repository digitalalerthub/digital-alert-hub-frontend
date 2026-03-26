import type { Rol } from '../../services/rolesService';
import type { User } from '../../types/User';

export const ITEMS_PER_PAGE = 10;

export const filterUsersBySearch = (
    users: User[],
    searchTerm: string,
): User[] => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return users;

    return users.filter((user) => {
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        const email = user.email.toLowerCase();

        return (
            fullName.includes(normalizedSearch) ||
            email.includes(normalizedSearch)
        );
    });
};

export const findRoleNameById = (roles: Rol[], roleId: number): string => {
    const role = roles.find((item) => item.id_rol === roleId);
    return role ? role.nombre_rol : 'Sin rol';
};

export const formatUserCreatedAt = (dateString: string): string => {
    try {
        const iso = dateString.replace(' ', 'T');
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return 'Fecha invalida';

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return 'Fecha invalida';
    }
};

export const getPaginatedUsers = (
    users: User[],
    currentPage: number,
    itemsPerPage: number,
) => {
    const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, users.length);

    return {
        totalPages,
        startIndex,
        endIndex,
        paginatedUsers: users.slice(startIndex, endIndex),
    };
};

export const buildVisiblePageNumbers = (
    currentPage: number,
    totalPages: number,
): number[] =>
    [...Array(Math.min(5, totalPages)).keys()].map((index) => {
        if (totalPages <= 5) {
            return index + 1;
        }

        if (currentPage <= 3) {
            return index + 1;
        }

        if (currentPage >= totalPages - 2) {
            return totalPages - 4 + index;
        }

        return currentPage - 2 + index;
    });
