'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: UserData | null;
    login: (token: string, userData: UserData) => void;
    logout: () => void;
    isLoading: boolean;
    isAdmin: boolean;
    checkPermission: (requiredRole: string) => boolean;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('userData');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser) as UserData;
                setUser(userData);
            } catch (error) {
                console.error('Error parsing userData:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                router.push('/login');
            }
        }
        setIsLoading(false);
    }, [router]);

    const login = (token: string, userData: UserData) => {
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push('/home');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    const getToken = (): string | null => {
        return localStorage.getItem('token');
    };

    const isAdmin = user?.role === 'admin';

    const checkPermission = (requiredRole: string): boolean => {
        if (!user) return false;
        if (requiredRole === 'admin') return isAdmin;
        return user.role === requiredRole;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isLoading,
            isAdmin,
            checkPermission,
            getToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles?: string[]
) {
    return function WithAuthComponent(props: P) {
        const { user, isLoading } = useAuth();
        const router = useRouter();

        if (isLoading) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!user) {
            router.push('/login');
            return null;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.push('/home');
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}