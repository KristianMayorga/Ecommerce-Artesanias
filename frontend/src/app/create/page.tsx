'use client';

import {Fragment, useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import {UserData} from "@/app/types";

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

const schema = yup.object().shape({
    name: yup.string()
        .required('El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    price: yup.number()
        .required('El precio es requerido')
        .positive('El precio debe ser positivo')
        .min(0.01, 'El precio mínimo es 0.01')
        .max(9999.99, 'El precio máximo es 9999.99'),
    category: yup.string()
        .required('La categoría es requerida')
        .oneOf(['Cerámica', 'Textiles', 'Joyería', 'Madera', 'Cestería', 'Metal'], 'Categoría no válida'),
    image: yup.string()
        .required('La imagen es requerida')
        .url('Debe ser una URL válida')
});

export default function CrearProducto() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm({
        resolver: yupResolver(schema)
    });

    useEffect(() => {

        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData) as UserData;
                if (parsedUserData.role == 'admin') {
                    setIsAdmin(true);
                } else{
                    router.push('/home');
                }
            } catch (error) {
                console.error('Error parsing userData:', error);
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    const onSubmit = async (data: Product) => {
        try {
            const storedProducts = localStorage.getItem('lista-productos');
            const products: Product[] = storedProducts ? JSON.parse(storedProducts) : [];

            const newProduct: Product = {...data, id: products.length + 1};
            products.push(newProduct);

            localStorage.setItem('lista-productos', JSON.stringify(products));

            await Swal.fire({
                title: '¡Éxito!',
                text: 'Producto creado correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            router.push('/home');
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: `Ocurrió un error al crear el producto: ${error}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg text-gray-600">
            {!loading ? (
                <Fragment>
                    { isAdmin ? (
                <div className="max-w-2xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg text-gray-600">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Crear Producto</h1>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <input
                                type="text"
                                {...register('name')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Precio
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Categoría
                            </label>
                            <select
                                {...register('category')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Seleccione una categoría</option>
                                <option value="Cerámica">Cerámica</option>
                                <option value="Textiles">Textiles</option>
                                <option value="Joyería">Joyería</option>
                                <option value="Madera">Madera</option>
                                <option value="Cestería">Cestería</option>
                                <option value="Metal">Metal</option>
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                URL de la imagen
                            </label>
                            <input
                                type="text"
                                {...register('image')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.image.message}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-300 py-2 px-4 text-sm font-medium text-gray-600 shadow-sm hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Crear Producto
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/home')}
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
                    ) : null}
                </Fragment>
            ) : (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
                    </div>
                </div>
            )}
        </div>
    );
}