'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth, withAuth} from "@/app/context/AuthContext";
import {ROLES} from "@/app/types";
import PedidoPersonalizado from "@/app/components/CustomOrderForm";

function NewCustomOrderPage() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
    }, [router, user]);

    return <PedidoPersonalizado />;
}

export default withAuth(NewCustomOrderPage, [ROLES.CLIENT, ROLES.POS])