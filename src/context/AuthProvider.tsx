// Controla el manejo global de autenticación

import { useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import type { JWTPayload } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            const now = Math.floor(Date.now() / 1000);
            return decoded.exp < now;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('token');

        if (savedToken && !isTokenExpired(savedToken)) {
            try {
                const decoded = jwtDecode<JWTPayload>(savedToken);
                setUser(decoded);
                setToken(savedToken);
            } catch {
                localStorage.removeItem('token');
            }
        } else {
            localStorage.removeItem('token');
        }

        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        const decoded = jwtDecode<JWTPayload>(newToken);
        setUser(decoded);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                isAdmin: user?.rol === 1,
                token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
