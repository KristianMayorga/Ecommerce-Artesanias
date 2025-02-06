'use client'

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import {useAuth} from "@/app/context/AuthContext";
import ListaDeseos from "@/app/components/ListaDeseos";
import {ROLES} from "@/app/types";

export default function Home() {

    const { user} = useAuth();

    return (
        <ProtectedRoute>
        <div className="container mx-auto px-4">
            {user?.role === ROLES.CLIENT && <ListaDeseos />}
        </div>
        </ProtectedRoute>
    );
}