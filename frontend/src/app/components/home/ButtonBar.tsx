'use client'

import Link from "next/link";
import Swal from "sweetalert2";
import {useAuth} from "@/app/context/AuthContext";
import {ChartNoAxesColumn, CirclePlus, PackagePlus} from "lucide-react";

const ButtonBar = () => {

    const {user} = useAuth();

    const handleReports = async () => {
        await Swal.fire({
            title: 'Función no implementada',
            text: 'La funcionalidad de reportes está en desarrollo',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
    };

    return (
        <div className="flex space-x-4 mb-6">
            {user?.role === 'admin' && (
                <div onClick={() => handleReports()} className={"cursor-pointer"}>
                    <div
                    className="flex items-center gap-2 px-4 py-2 bg-orange-300 hover:bg-orange-400 text-gray-600 rounded-lg transition-colors"
                    >
                    <ChartNoAxesColumn size={20}/>
                    Ver Reportes
                    </div>
                </div>
            )}
            {user?.role === 'admin' && (
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
        </div>
    );
};

export default ButtonBar;