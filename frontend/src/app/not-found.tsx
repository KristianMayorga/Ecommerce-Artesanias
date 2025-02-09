'use client';

import { useRouter } from 'next/navigation';
import {AlertTriangle} from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="mt-12 sm:mt-16 md:mt-24 flex flex-col items-center justify-center px-4 sm:px-6">
            <div className="max-w-lg w-full text-center space-y-6">
                <div className="mb-6">
                    <AlertTriangle className="mx-auto h-24 w-24 text-rose-300" />
                </div>

                <h1 className="text-8xl font-bold text-rose-300">404</h1>

                <div className="flex items-center justify-center space-x-4">
                    <div className="h-1 w-12 bg-rose-200 rounded-full"></div>
                    <h2 className="text-2xl font-medium text-rose-700">¡Ups! Página no encontrada</h2>
                    <div className="h-1 w-12 bg-rose-200 rounded-full"></div>
                </div>

                <p className="text-rose-600">
                    Lo sentimos, parece que te has perdido. La página que estás buscando no existe o ha sido movida a otra ubicación.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex justify-center rounded-md border border-transparent bg-rose-200 py-2.5 px-5 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                    >
                        Volver atrás
                    </button>

                    <button
                        onClick={() => router.push('/home')}
                        className="inline-flex justify-center rounded-md border border-rose-200 bg-white py-2.5 px-5 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                    >
                        Ir al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}