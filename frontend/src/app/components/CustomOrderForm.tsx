'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';

type CustomOrderInputs = {
    customerName: string;
    email: string;
    phone: string;
    category: string;
    description: string;
    budget: string;
    preferredDeadline: string;
    referenceImage?: string;
    specialRequirements?: string;
};

const schema = yup.object().shape({
    customerName: yup.string()
        .required('El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    email: yup.string()
        .required('El email es requerido')
        .email('Debe ser un email válido'),
    phone: yup.string()
        .required('El teléfono es requerido')
        .matches(/^\+?[\d\s-]{8,}$/, 'Ingrese un número de teléfono válido'),
    category: yup.string()
        .required('La categoría es requerida')
        .oneOf(['Cerámica', 'Textiles', 'Joyería', 'Madera', 'Cestería', 'Metal'], 'Categoría no válida'),
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
        .test('min', 'El presupuesto mínimo es 10', value => {
            if (!value) return false;
            const num = parseFloat(value);
            return num >= 10;
        })
        .test('max', 'El presupuesto máximo es 99999.99', value => {
            if (!value) return false;
            const num = parseFloat(value);
            return num <= 99999.99;
        }),
    preferredDeadline: yup.string()
        .required('La fecha de entrega preferida es requerida')
        .test('is-future', 'La fecha debe ser al menos 1 semana después de hoy', value => {
            if (!value) return false;
            const date = new Date(value);
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 7);
            return date >= minDate;
        }),
    referenceImage: yup.string()
        .url('Debe ser una URL válida')
        .optional(),
    specialRequirements: yup.string()
        .max(200, 'Los requisitos especiales no pueden exceder 200 caracteres')
        .optional()
});

export default function PedidoPersonalizado() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [minDate, setMinDate] = useState('');

    useEffect(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setMinDate(date.toISOString().split('T')[0]);
    }, []);

    const {register, handleSubmit, formState: {errors}} = useForm<CustomOrderInputs>({
        resolver: yupResolver(schema)
    });

    const onSubmit: SubmitHandler<CustomOrderInputs> = async (data) => {
        try {
            setLoading(true);

            const storedOrders = localStorage.getItem('pedidos-personalizados');
            const orders = storedOrders ? JSON.parse(storedOrders) : [];

            const newOrder = {
                ...data,
                budget: parseFloat(data.budget),
                orderId: Date.now(),
                status: 'pendiente',
                orderDate: new Date().toISOString()
            };

            orders.push(newOrder);
            localStorage.setItem('pedidos-personalizados', JSON.stringify(orders));

            await Swal.fire({
                title: '¡Éxito!',
                text: 'Tu pedido personalizado ha sido enviado. Nos pondremos en contacto contigo pronto.',
                icon: 'success',
                timer: 2500,
                showConfirmButton: false
            });

            router.push('/custom-order');
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: `Ocurrió un error al enviar tu pedido: ${error}`,
                icon: 'error',
                confirmButtonText: 'Ok'
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            {...register('customerName')}
                            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.customerName && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.customerName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            {...register('phone')}
                            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+XX XXX XXX XXXX"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

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
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.category.message}
                            </p>
                        )}
                    </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Presupuesto (COP)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="10"
                            max="99999.99"
                            {...register('budget')}
                            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.budget && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.budget.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de entrega preferida
                        </label>
                        <input
                            type="date"
                            min={minDate}
                            {...register('preferredDeadline')}
                            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.preferredDeadline && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.preferredDeadline.message}
                            </p>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de imagen de referencia (opcional)
                    </label>
                    <input
                        type="text"
                        {...register('referenceImage')}
                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    {errors.referenceImage && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.referenceImage.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requisitos especiales (opcional)
                    </label>
                    <textarea
                        {...register('specialRequirements')}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="¿Alguna consideración especial que debamos tener en cuenta?"
                    />
                    {errors.specialRequirements && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.specialRequirements.message}
                        </p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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