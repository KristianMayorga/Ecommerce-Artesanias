'use client'

import Link from "next/link";
import {useAuth} from "@/app/context/AuthContext";
import {ChartNoAxesColumn, CirclePlus, Heart, PackagePlus, Users} from "lucide-react";
import {ROLES} from "@/app/types";


const ButtonBar = () => {
    const {user} = useAuth();

    return (
        <div className="flex space-x-4 mb-6">
            {user?.role === ROLES.ADMIN && (
                <Link href="/reports">
                    <div
                    className="flex items-center gap-2 px-4 py-2 bg-orange-300 hover:bg-orange-400 text-gray-600 rounded-lg transition-colors"
                    >
                    <ChartNoAxesColumn size={20}/>
                    Ver Reportes
                    </div>
                </Link>
            )}
            {user?.role === ROLES.ADMIN && (
                <Link href="/create">
                    <div
                        className="flex items-center gap-2 px-4 py-2 bg-green-300 hover:bg-green-400 text-gray-600 rounded-lg transition-colors"
                    >
                        <CirclePlus size={20}/>
                        Crear producto
                    </div>
                </Link>
            )}
            <Link href="/custom-order">
            <div
                className="flex items-center gap-2 px-4 py-2 bg-blue-300 hover:bg-blue-400 text-gray-600 rounded-lg transition-colors"
            >
                <PackagePlus size={20}/>
                Ver pedidos personalizados
            </div>
            </Link>
            {user?.role === ROLES.ADMIN && (
                <Link href="/users">
                    <div
                        className="flex items-center gap-2 px-4 py-2 bg-purple-300 hover:bg-purple-400 text-gray-600 rounded-lg transition-colors"
                    >
                        <Users size={20}/>
                        Gestión de Usuarios
                    </div>
                </Link>
            )}
            {user?.role === ROLES.CLIENT && (
                <Link href="/wishlist">
                    <div
                        className="flex items-center gap-2 px-4 py-2 bg-pink-300 hover:bg-pink-400 text-gray-600 rounded-lg transition-colors"
                    >
                        <Heart size={20}/>
                        Mi lista de deseos
                    </div>
                </Link>
            )}
        </div>
    );
};

export default ButtonBar;