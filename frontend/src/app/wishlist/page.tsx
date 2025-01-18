'use client'

import HomeAdmin from "@/app/components/HomeAdmin";
import HomeClient from "@/app/components/HomeClient";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import {useAuth} from "@/app/context/AuthContext";
import ListaDeseos from "@/app/components/ListaDeseos";

export default function Home() {

    const { user} = useAuth();

    return (
        <ProtectedRoute>
        <div className="container mx-auto px-4">
            {user?.role === 'cliente' && <ListaDeseos />}
        </div>
        </ProtectedRoute>
    );
}