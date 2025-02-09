'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";
import { CONST } from "@/app/constants";
import Link from "next/link";

interface IFormInputs {
    name: string;
    lastName: string;
    email: string;
    documentId: string;
    pss: string;
    confirmPassword: string;
    adress: string;
    phone: string;
    dateOfBirth: string;
}

const schema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .required('El nombre es obligatorio'),
    lastName: yup
        .string()
        .trim()
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'El apellido solo puede contener letras')
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .required('El apellido es obligatorio'),
    email: yup
        .string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo válido.')
        .required('El correo es obligatorio'),
    documentId: yup
        .string()
        .matches(/^\d{8,10}$/, 'El documento debe tener entre 8 y 10 dígitos')
        .required('El documento es obligatorio'),
    pss: yup
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .required('La contraseña es obligatoria'),
    confirmPassword: yup
        .string()
        .required('Confirma la contraseña')
        .oneOf([yup.ref('pss')], 'Las contraseñas no coinciden'),
    adress: yup
        .string()
        .required('La dirección es obligatoria'),
    phone: yup
        .string()
        .matches(/^\d{10}$/, 'El teléfono debe tener 10 dígitos')
        .required('El teléfono es obligatorio'),
    dateOfBirth: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
        .required('La fecha de nacimiento es obligatoria')
});

const Register: React.FC = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IFormInputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
        try {
            const response = await fetch(`${CONST.url}/usuario/add-clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    lastName: data.lastName,
                    email: data.email,
                    documentId: data.documentId,
                    pss: data.pss,
                    adress: data.adress,
                    phone: data.phone,
                    dateOfBirth: data.dateOfBirth
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                await Swal.fire({
                    title: '¡Error!',
                    text: errorData.message || 'Error en el registro',
                    icon: 'error',
                    timer: 1500,
                    position: 'top-end',
                    toast: true,
                    showConfirmButton: false
                });
                return;
            }

            await Swal.fire({
                title: '¡Registrado!',
                text: 'Registro Exitoso',
                icon: 'success',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });

            setTimeout(() => {
                router.push('/login');
            }, 1500);

        } catch (error) {
            console.error('Error durante el registro:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white/50 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registro</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block mb-1 font-medium text-gray-800">Nombre</label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label htmlFor="lastName" className="block mb-1 font-medium text-gray-800">Apellido</label>
                    <input
                        id="lastName"
                        type="text"
                        {...register('lastName')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block mb-1 font-medium text-gray-800">Correo</label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="documentId" className="block mb-1 font-medium text-gray-800">Documento de Identidad</label>
                    <input
                        id="documentId"
                        type="text"
                        {...register('documentId')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.documentId && <p className="text-red-500 text-sm mt-1">{errors.documentId.message}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className="block mb-1 font-medium text-gray-800">Teléfono</label>
                    <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                    <label htmlFor="adress" className="block mb-1 font-medium text-gray-800">Dirección</label>
                    <input
                        id="adress"
                        type="text"
                        {...register('adress')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.adress && <p className="text-red-500 text-sm mt-1">{errors.adress.message}</p>}
                </div>

                <div>
                    <label htmlFor="dateOfBirth" className="block mb-1 font-medium text-gray-800">Fecha de Nacimiento</label>
                    <input
                        id="dateOfBirth"
                        type="date"
                        {...register('dateOfBirth')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                </div>

                <div>
                    <label htmlFor="pss" className="block mb-1 font-medium text-gray-800">Contraseña</label>
                    <input
                        id="pss"
                        type="password"
                        {...register('pss')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.pss && <p className="text-red-500 text-sm mt-1">{errors.pss.message}</p>}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-800">Confirmar Contraseña</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-900 disabled:bg-teal-500 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>
            <div className="pt-6 text-gray-700">
                <Link href="/login">Ya tengo una cuenta!</Link>
            </div>
        </div>
    );
};

export default Register;