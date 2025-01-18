'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderForm from '@/app/components/CustomOrderForm';

interface UserData {
    name: string;
    role: 'admin' | 'cliente';
}

export default function NewCustomOrderPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) {
            router.push('/login');
            return;
        }
        const parsedUserData = JSON.parse(storedUserData);
        if (parsedUserData.role === 'admin') {
            router.push('/custom-order');
            return;
        }
        setUserData(parsedUserData);
    }, [router]);

    if (!userData) return null;

    return <OrderForm />;
}