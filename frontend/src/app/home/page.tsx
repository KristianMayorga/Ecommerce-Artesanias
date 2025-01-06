'use client'

import HomeAdmin from "@/app/components/HomeAdmin";
import HomeClient from "@/app/components/HomeClient";
import HomePOS from "@/app/components/HomePOS";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import {useAuth} from "@/app/context/AuthContext";

export default function Home() {

    const { user} = useAuth();

    return (
        <ProtectedRoute>
        <div className="container mx-auto px-4">
            {user?.role === 'admin' &&  <HomeAdmin name={user.name}/>}
            {user?.role === 'vendedor' && <HomePOS name={user.name} />}
            {user?.role === 'cliente' && <HomeClient name={user.name} />}
        </div>
        </ProtectedRoute>
    );
}