'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth} from "@/app/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading, checkPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        if (!isLoading && requiredRole && !checkPermission(requiredRole)) {
            router.push('/home');
        }
    }, [isLoading, user, requiredRole, router, checkPermission]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || (requiredRole && !checkPermission(requiredRole))) {
        return null;
    }

    return <>{children}</>;
}