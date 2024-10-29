'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

interface ILoginInputs {
    email: string;
    password: string;
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

// Mock de usuario para validación
const mockUsers =[
    {
        name: "Pepito Perez",
        email: 'usuario@ejemplo.com',
        password: 'Contraseña123!',
        role: 'admin',
    },
    {
        name: "Patricio Estrella",
        email: 'patricio123@ejemplo.com',
        password: 'Contraseña123!',
        role: 'cliente',
    },
    {
        name: "Juanito Juarez",
        email: 'vendedorJuanito@ejemplo.com',
        password: 'Contraseña123!',
        role: 'vendedor',
    }
];

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
        const foundUser = mockUsers.find((user) =>
            data.email === user.email && data.password === user.password
        );

        if (foundUser) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(foundUser));
            router.push('/home');
        } else {
            setLoginError('Correo o contraseña incorrectos');
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
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block mb-1 font-medium text-gray-800">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
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