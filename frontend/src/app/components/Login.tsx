'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from "@/app/context/AuthContext";
import { LogInIcon } from "lucide-react";
import Swal from "sweetalert2";
import {CONST} from "@/app/constants";
import Link from "next/link";

interface ILoginInputs {
    email: string;
    password: string;
}

interface LoginResponse {
    access: string;
    role: string;
    nombre?: string;
}

const schema = yup.object().shape({
    email: yup
        .string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo válido.')
        .required('El correo es obligatorio'),
    password: yup
        .string()
        .required('La contraseña es obligatoria'),
});

const Login: React.FC = () => {
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ILoginInputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<ILoginInputs> = async (data) => {
        try {
            const response = await fetch(`${CONST.url}/accounts/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (errorData.detail) {
                    await Swal.fire({
                        title: '¡Error!',
                        text: errorData.detail,
                        icon: 'error',
                        timer: 1500,
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false
                    });
                } else {
                    await Swal.fire({
                        title: '¡Error!',
                        text: 'Crendenciales Inválidas',
                        icon: 'error',
                        timer: 1500,
                        position: 'top-end',
                        toast: true,
                        showConfirmButton: false
                    });
                }

                return;
            }

            const responseData: LoginResponse = await response.json();

            const userData = {
                name: responseData.nombre || 'Usuario',
                email: data.email,
                role: responseData.role,
            };

            login(responseData.access, userData);

            await Swal.fire({
                title: '¡Inicio Correcto!',
                text: `Exitoso`,
                icon: 'success',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white/50 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <label htmlFor="password" className="block mb-1 font-medium text-gray-800">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center gap-2 justify-center bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors hover:bg-teal-900 disabled:bg-teal-500 disabled:cursor-not-allowed"
                >
                    <LogInIcon size={20} />
                    {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>
            <div className={"pt-6 text-gray-700"}>
                <Link href={"/register"}>Aún no tengo cuenta!</Link>
            </div>
        </div>
    );
};

export default Login;