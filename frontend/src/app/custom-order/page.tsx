'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListaPedidos from "@/app/components/custom-order/ListaPedidos";

interface UserData {
    name: string;
    role: 'admin' | 'cliente';
    email: string;
}

export default function CustomOrdersPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) {
            router.push('/login');
            return;
        }
        setUserData(JSON.parse(storedUserData));
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {userData?.role === 'admin' ? 'Gestión de Pedidos Personalizados' : 'Mis Pedidos Personalizados'}
                </h1>
                {userData?.role !== 'admin' && (
                    <Link
                        href="/custom-order/new"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Nuevo Pedido
                    </Link>
                )}
            </div>
            <ListaPedidos />

        </div>
    );
}