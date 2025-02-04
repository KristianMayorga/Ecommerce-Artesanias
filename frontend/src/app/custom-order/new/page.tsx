'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrderForm from '@/app/components/CustomOrderForm';
import {useAuth, withAuth} from "@/app/context/AuthContext";
import {ROLES} from "@/app/types";

function NewCustomOrderPage() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
    }, [router]);

    return <OrderForm />;
}

export default withAuth(NewCustomOrderPage, [ROLES.CLIENT, ROLES.POS])