'use client';

import {Fragment, useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import {SubmitHandler, useForm} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import {UserData} from "@/app/types";
import {Product} from "@/app/components/ListaProductos";

type ProductFormInputs = Omit<Product, 'id'>;

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
        .oneOf(['Cerámica', 'Textiles', 'Joyería', 'Madera', 'Cestería', 'Metal'],
            'Categoría no válida'),
    image: yup.string()
        .required('La imagen es requerida')
        .url('Debe ser una URL válida'),
    amount: yup.number()
        .required('La cantidad es requerida')
        .positive('La cantidad debe de ser positiva')
        .min(1, 'La cantidad mínima es 1')
        .max(100, 'La cantidad maxima es 100')
        .integer('La cantidad debe ser un número entero')
});

export default function EditarProducto({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: yupResolver(schema)
    });

    // Evitar problemas de hidratación
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Verificar si el usuario está logueado
        const checkAuth = async () => {
            const userData = localStorage.getItem('userData');
            if (!userData) {
                await Swal.fire({
                    title: 'Error',
                    text: 'Debes iniciar sesión para acceder a esta página',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                router.push('/login');
                return;
            }

            try {
                const parsedUserData = JSON.parse(userData) as UserData;
                if (parsedUserData.role == 'admin') {
                    setIsAdmin(true);
                } else{
                    router.push('/home');
                }
            } catch (error) {
                console.error('Error parsing userData:', error);
                router.push('/login');
            }

            // Cargar producto
            const storedProducts = localStorage.getItem('lista-productos');
            if (!storedProducts) {
                router.push('/404');
                return;
            }

            const products: Product[] = JSON.parse(storedProducts);
            const product = products.find(p => p.id === Number(params.id));

            if (!product) {
                router.push('/404');
                return;
            }

            // Establecer valores iniciales
            setValue('name', product.name);
            setValue('price', product.price);
            setValue('category', product.category);
            setValue('image', product.image);
            setValue('amount', product.amount);

            setIsLoading(false);
        };

        if (isClient) {
            checkAuth();
        }
    }, [params.id, router, setValue, isClient]);

    const onSubmit: SubmitHandler<ProductFormInputs> = async (data) => {
        try {
            const storedProducts = localStorage.getItem('lista-productos');
            if (!storedProducts) throw new Error('No se encontraron productos');

            const products: Product[] = JSON.parse(storedProducts);
            const updatedProducts = products.map(product =>
                product.id === Number(params.id)
                    ? { ...product, ...data }
                    : product
            );

            localStorage.setItem('lista-productos', JSON.stringify(updatedProducts));

            await Swal.fire({
                title: '¡Éxito!',
                text: 'Producto actualizado correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            router.push('/home');
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: `Ocurrió un error al actualizar el producto ${error}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    if (!isClient || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg text-gray-600">
            {isAdmin ? (
                <Fragment>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Producto</h1>
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
                                Cantidad
                            </label>
                            <input
                                type="number"
                                {...register('amount')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.amount && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.amount.message}
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
                                Guardar cambios
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
                </Fragment>) : null}
        </div>
    );
}
