'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { withAuth } from "@/app/context/AuthContext";
import { CONST } from "@/app/constants";
import Image from 'next/image';
import {Category, EditProductFormInputs, POS, ROLES, Stock, StockData, StocksByPOS} from "@/app/types";
import {Plus} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


type TestValue = {
    [key: string]: StockData;
} | undefined;

const schema = yup.object().shape({
    name: yup.string()
        .required('El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    unitPrice: yup.number()
        .required('El precio es requerido')
        .positive('El precio debe ser positivo')
        .min(0.01, 'El precio mínimo es 0.01'),
    category: yup.string()
        .required('La categoría es requerida'),
    description: yup.string()
        .required('La descripción es requerida')
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(200, 'La descripción no puede exceder 200 caracteres'),
    image: yup.mixed<FileList>()
        .test('fileSize', 'El archivo es demasiado grande (máximo 5MB)', (value) => {
            if (!value?.[0]) return true;
            return value[0].size <= MAX_FILE_SIZE;
        })
        .test('fileType', 'Formato de archivo no soportado', (value) => {
            if (!value?.[0]) return true;
            return ACCEPTED_IMAGE_TYPES.includes(value[0].type);
        }),
    stocks: yup.object().test('stocks', 'Los stocks deben ser números positivos cuando se especifican', (value: TestValue) => {
        if (!value) return true;
        return Object.values(value).every((stock) => {
            if (!stock || !stock.amount) return true;
            return stock.amount > 0;
        });
    })
});

function EditarProducto({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [posList, setPOSList] = useState<POS[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState<string>('');

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditProductFormInputs>({
        resolver: yupResolver(schema),
        defaultValues: {
            category: ''
        }
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
        const loadInitialData = async () => {
            try {
                const posResponse = await fetch(`${CONST.url}/pos/read-pos`);
                if (!posResponse.ok) throw new Error('Failed to fetch POS list');
                const posData = await posResponse.json();
                setPOSList(posData.posList);

                const categoriesResponse = await fetch(`${CONST.url}/categoriaProd/read-cp`);
                if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.cps);

                const productResponse = await fetch(`${CONST.url}/product/read-product/${params.id}`);
                if (!productResponse.ok) throw new Error('Failed to fetch product');
                const productData = await productResponse.json();

                const stockPromises = posData.posList.map((pos: POS) =>
                    fetch(`${CONST.url}/stock/read-stockPOS/${pos._id}`)
                        .then(response => response.ok ? response.json() : null)
                );

                const allStocksResponses = await Promise.all(stockPromises);

                setValue('name', productData.data.name);
                setValue('unitPrice', productData.data.unitPrice);
                setValue('category', productData.data.category._id || productData.data.category);
                setValue('description', productData.data.description);
                setCurrentImage(productData.data.image);

                const initialStocks: StocksByPOS = {};
                posData.posList.forEach((pos: POS, index: number) => {
                    const stocksData = allStocksResponses[index];
                    if (stocksData && stocksData.stocks) {
                        const existingStock = stocksData.stocks.find(
                            (stock: Stock) => stock.idProduct._id === params.id
                        );
                        if (existingStock) {
                            initialStocks[pos._id] = {
                                stockId: existingStock._id,
                                amount: existingStock.amount
                            };
                        }
                    }
                });

                setValue('stocks', initialStocks);

                setIsLoading(false);
            } catch (error) {
                console.error('Error loading initial data:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Error al cargar los datos',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                router.push('/home');
            }
        };

        loadInitialData();
    }, [params.id, setValue, router]);

    const onSubmit: SubmitHandler<EditProductFormInputs> = async (data) => {
        try {
            Swal.fire({
                title: 'Actualizando producto',
                text: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('unitPrice', data.unitPrice.toString());
            formData.append('quali', '5');
            formData.append('category', data.category);
            formData.append('description', data.description);
            formData.append('state', 'true');

            if (data.image?.[0]) {
                formData.append('image', data.image[0]);
            }

            const productResponse = await fetch(`${CONST.url}/product/update-product/${params.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!productResponse.ok) {
                throw new Error('Failed to update product');
            }

            const stockPromises = Object.entries(data.stocks || {}).map(async ([posId, stockData]) => {
                if (!stockData || !stockData.amount) return;

                if (stockData.stockId) {
                    return fetch(`${CONST.url}/stock/update-stock/${stockData.stockId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: stockData.amount,
                        }),
                    });
                } else {
                    return fetch(`${CONST.url}/stock/add-stock`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: stockData.amount,
                            idProduct: params.id,
                            idPOS: posId,
                        }),
                    });
                }
            }).filter(Boolean);

            await Promise.all(stockPromises);

            Swal.close();
            await Swal.fire({
                title: '¡Éxito!',
                text: 'Producto actualizado correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            router.push('/home');
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.close();
            await Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al actualizar el producto',
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
                        Categoría
                    </label>
                    <select
                        {...register('category')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        defaultValue=""
                    >
                        <option value="" disabled>Seleccione una categoría</option>
                        {categories.map((category: Category) => (
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
                    <div className="mt-2">
                        <Image
                            src={imagePreview || currentImage}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="h-32 w-32 object-cover rounded-lg"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Stock por Tienda</h2>
                    <div className="space-y-4">
                        {posList.map((pos) => {
                            const currentStock = watch(`stocks.${pos._id}`);

                            return (
                                <div key={pos._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{pos.name}</p>
                                        <p className="text-sm text-gray-500">{pos.city}</p>
                                    </div>
                                    <div className="w-32">
                                        {currentStock ? (
                                            <>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Stock actual: {currentStock.amount}
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register(`stocks.${pos._id}.amount`)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="Agregar stock"
                                                />
                                                <input
                                                    type="hidden"
                                                    {...register(`stocks.${pos._id}.stockId`)}
                                                />
                                            </>
                                        ) : (
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setValue(`stocks.${pos._id}`, { amount: 1 });
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Agregar stock
                                                </button>
                                                {watch(`stocks.${pos._id}`) && (
                                                    <div className="mt-2">
                                                        <input
                                                            type="number"
                                                            {...register(`stocks.${pos._id}.amount`)}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="Cantidad"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setValue(`stocks.${pos._id}`, undefined);
                                                            }}
                                                            className="text-xs text-red-600 hover:text-red-800 mt-1"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {typeof errors.stocks?.message === 'string' && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.stocks.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
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
        </div>
    );
}

export default withAuth(EditarProducto, [ROLES.ADMIN]);