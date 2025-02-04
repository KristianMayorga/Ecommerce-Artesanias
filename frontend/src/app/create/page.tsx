'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { withAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from 'react';
import { CONST } from "@/app/constants";
import {Category, CategoryResponse, ProductFormInputs, ROLES} from "@/app/types";
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const schema = yup.object().shape({
    name: yup.string()
        .required('El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    unitPrice: yup.number()
        .required('El precio es requerido')
        .positive('El precio debe ser positivo')
        .min(0.01, 'El precio mínimo es 0.01'),
    quali: yup.number()
        .required('La calidad es requerida')
        .min(1, 'La calidad mínima es 1')
        .max(5, 'La calidad máxima es 5')
        .integer('La calidad debe ser un número entero'),
    category: yup.string()
        .required('La categoría es requerida'),
    description: yup.string()
        .required('La descripción es requerida')
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(200, 'La descripción no puede exceder 200 caracteres'),
    image: yup.mixed<FileList>()
        .required('La imagen es requerida')
        .test('fileSize', 'El archivo es demasiado grande (máximo 5MB)', (value) => {
            if (!value?.[0]) return true;
            return value[0].size <= MAX_FILE_SIZE;
        })
        .test('fileType', 'Formato de archivo no soportado', (value) => {
            if (!value?.[0]) return true;
            return ACCEPTED_IMAGE_TYPES.includes(value[0].type);
        }),
    amount: yup.number()
        .required('La cantidad es requerida')
        .positive('La cantidad debe de ser positiva')
        .min(1, 'La cantidad mínima es 1')
        .max(100, 'La cantidad maxima es 100')
        .integer('La cantidad debe ser un número entero')
});

function CrearProducto() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<ProductFormInputs>({
        resolver: yupResolver(schema)
    });

    const selectedImage = watch('image');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (selectedImage && selectedImage[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedImage[0]);
        }
    }, [selectedImage]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${CONST.url}/categoriaProd/read-cp`);
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data: CategoryResponse = await response.json();
                setCategories(data.cps);
            } catch (error) {
                console.error('Error fetching categories:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar las categorías',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const onSubmit: SubmitHandler<ProductFormInputs> = async (data) => {
        try {
            // Mostrar loading
            Swal.fire({
                title: 'Creando producto',
                text: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Crear FormData para el producto
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('unitPrice', data.unitPrice.toString());
            formData.append('quali', data.quali.toString());
            formData.append('category', data.category);
            formData.append('description', data.description);
            formData.append('state', 'true');
            formData.append('image', data.image[0]);

            // Primer paso: Crear el producto
            const productResponse = await fetch(`${CONST.url}/product/add-product`, {
                method: 'POST',
                body: formData,
            });

            if (!productResponse.ok) {
                throw new Error('Failed to create product');
            }

            const productData = await productResponse.json();

            if (productData.error) {
                throw new Error(productData.message || 'Error creating product');
            }

            const stockResponse = await fetch(`${CONST.url}/stock/add-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: data.amount,
                    idProduct: productData.data._id,
                    idPOS: "679b79e35bf0603cba16bb1f",
                }),
            });

            if (!stockResponse.ok) {
                throw new Error('Failed to create stock');
            }

            Swal.close();

            await Swal.fire({
                title: '¡Éxito!',
                text: 'Producto creado correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            router.push('/home');
        } catch (error) {
            console.error('Error creating product:', error);
            Swal.close();

            await Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al crear el producto',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
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
                        Precio Unitario
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('unitPrice')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.unitPrice && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.unitPrice.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Calidad (1-5)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        {...register('quali')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.quali && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.quali.message}
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
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.category.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Descripción
                    </label>
                    <textarea
                        {...register('description')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Imagen
                    </label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        {...register('image')}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                    />
                    {errors.image && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.image.message}
                        </p>
                    )}
                    {imagePreview && (
                        <div className="mt-2">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                width={128}
                                height={128}
                                className="h-32 w-32 object-cover rounded-lg"
                            />
                        </div>
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
    );
}

export default withAuth(CrearProducto, [ROLES.ADMIN]);