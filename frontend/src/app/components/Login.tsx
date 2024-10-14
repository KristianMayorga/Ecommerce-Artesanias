'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

interface ILoginInputs {
    correo: string;
    contraseña: string;
}

const schema = yup.object().shape({
    correo: yup
        .string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo válido.')
        .required('El correo es obligatorio'),
    contraseña: yup
        .string()
        .required('La contraseña es obligatoria'),
});

// Mock de usuario para validación
const mockUser = {
    correo: 'usuario@ejemplo.com',
    contraseña: 'Contraseña123!'
};

const Login: React.FC = () => {
    const router = useRouter();
    const [loginError, setLoginError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginInputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<ILoginInputs> = (data) => {
        if (data.correo === mockUser.correo && data.contraseña === mockUser.contraseña) {
            // Login exitoso
            localStorage.setItem('isLoggedIn', 'true');
            router.push('/home');
        } else {
            // Login fallido
            setLoginError('Correo o contraseña incorrectos');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white/50 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="correo" className="block mb-1 font-medium">Correo</label>
                    <input
                        id="correo"
                        type="email"
                        {...register('correo')}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>}
                </div>

                <div>
                    <label htmlFor="contraseña" className="block mb-1 font-medium">Contraseña</label>
                    <input
                        id="contraseña"
                        type="password"
                        {...register('contraseña')}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.contraseña && <p className="text-red-500 text-sm mt-1">{errors.contraseña.message}</p>}
                </div>

                {loginError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{loginError}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-900"
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
};

export default Login;