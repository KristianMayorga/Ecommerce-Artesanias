'use client'

import HomeAdmin from "@/app/components/HomeAdmin";
import HomeClient from "@/app/components/HomeClient";
import HomePOS from "@/app/components/HomePOS";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import {useAuth} from "@/app/context/AuthContext";
import {ROLES} from "@/app/types";

export default function Home() {

    const {user} = useAuth();

    return (
        <ProtectedRoute>
        <div className="container mx-auto px-4">
            {user?.role === ROLES.ADMIN &&  <HomeAdmin name={user.name}/>}
            {user?.role === ROLES.POS && <HomePOS name={user.name} />}
            {user?.role === ROLES.CLIENT && <HomeClient name={user.name} />}
        </div>
        </ProtectedRoute>
    );
}