/* Define estructura del contexto los datos que se compartiran - SOLO types (Vite OK) */

import { createContext } from 'react';
import type { CanonicalRoleName } from '../utils/roles';

export interface JWTPayload {
    id: number;
    email: string;
    rol: number;
    role_name?: CanonicalRoleName | null;
    exp: number;
}

export interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: JWTPayload | null;
    isAdmin: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);
