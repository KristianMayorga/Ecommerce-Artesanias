import Link from 'next/link';
import ListaProductos from "@/app/components/ListaProductos";
import Swal from "sweetalert2";

export default function HomeAdmin({name}: {name:string}) {
    const handleReports = () => {
        Swal.fire({
            title: 'Función no implementada',
            text: 'La funcionalidad de reportes está en desarrollo',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
    };

    return (
        <div className="py-8">
            <h1 className="text-3xl text-gray-800 font-bold mb-6">Bienvenido, {name}!</h1>
            <div className="flex space-x-4 mb-6">
                <Link href="" onClick={() => handleReports()} className="bg-blue-300 hover:bg-blue-400 text-gray-600 font-bold py-2 px-4 rounded">
                    Ver reportes
                </Link>
                <Link href="/create" className="bg-green-300 hover:bg-green-400 text-gray-600 font-bold py-2 px-4 rounded">
                    Crear producto
                </Link>
                <Link href="/custom-order" className="bg-blue-300 hover:bg-blue-400 text-gray-600 font-bold py-2 px-4 rounded">
                    Ver pedidos personalizados
                </Link>
            </div>
            <ListaProductos isAdmin={true} />
        </div>
    );
}