'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { useAuth } from "@/app/context/AuthContext";
import { CONST } from "@/app/constants";

type CustomOrderInputs = {
    category: string;
    description: string;
    budget: string;
};

const schema = yup.object().shape({
    category: yup.string()
        .required('La categoría es requerida')
        .oneOf(['Cerámica', 'Textiles', 'Joyería', 'Madera', 'Cestería', 'Metal', 'Diseño'], 'Categoría no válida'),
    description: yup.string()
        .required('La descripción es requerida')
        .min(20, 'La descripción debe tener al menos 20 caracteres')
        .max(500, 'La descripción no puede exceder 500 caracteres'),
    budget: yup.string()
        .required('El presupuesto es requerido')
        .test('is-valid-number', 'El presupuesto debe ser un número válido', value => {
            if (!value) return false;
            const num = parseFloat(value);
            return !isNaN(num);
        })
        .test('is-positive', 'El presupuesto debe ser positivo', value => {
            if (!value) return false;
            const num = parseFloat(value);
            return num > 0;
        })
});

export default function PedidoPersonalizado() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CustomOrderInputs>({
        resolver: yupResolver(schema)
    });

    const parseJwt = (token: string) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.log(e);
            return null;
        }
    };

    const onSubmit: SubmitHandler<CustomOrderInputs> = async (data) => {
        try {
            setLoading(true);
            const token = getToken();

            if (!token) {
                await Swal.fire({
                    title: 'Error',
                    text: 'Debes iniciar sesión para realizar un pedido personalizado',
                    icon: 'error',
                    timer: 1500,
                    position: 'top-end',
                    toast: true,
                    showConfirmButton: false
                });
                router.push('/login');
                return;
            }

            const response = await fetch(`${CONST.url}/personalization/add-personalization`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: data.category,
                    state: 'pendiente',
                    description: data.description,
                    budget: parseFloat(data.budget),
                    userId: parseJwt(token).userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el pedido');
            }

            await Swal.fire({
                title: '¡Éxito!',
                text: 'Tu pedido personalizado ha sido enviado. Nos pondremos en contacto contigo pronto.',
                icon: 'success',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });

            router.push('/home');
        } catch (error) {
            console.error('Error al crear pedido:', error);
            await Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al procesar tu pedido',
                icon: 'error',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 mt-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Solicitar Pedido Personalizado</h1>
            <p className="mb-6 text-gray-600">
                Cuéntanos sobre la pieza artesanal que te gustaría encargar. Mientras más detalles nos proporciones,
                mejor podremos entender tu visión.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría de Artesanía
                    </label>
                    <select
                        {...register('category')}
                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccione una categoría</option>
                        <option value="Cerámica">Cerámica</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Joyería">Joyería</option>
                        <option value="Madera">Madera</option>
                        <option value="Cestería">Cestería</option>
                        <option value="Metal">Metal</option>
                        <option value="Diseño">Diseño</option>
                    </select>
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.category.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción detallada del pedido
                    </label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe el producto que deseas, incluyendo tamaño, colores, materiales preferidos, etc."
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Presupuesto (COP)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('budget')}
                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.budget && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.budget.message}
                        </p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enviando...' : 'Enviar Pedido'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/home')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}