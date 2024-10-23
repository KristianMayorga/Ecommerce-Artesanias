'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

interface IFormInputs {
    name: string;
    email: string;
    password: string;
    role: string;
}

const schema = yup.object().shape({
    name: yup.string().required('El nombre es obligatorio'),
    email: yup
        .string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo válido.')
        .required('El correo es obligatorio'),
    password: yup
        .string()
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
        )
        .required('La contraseña es obligatoria'),
    role: yup.string().default('user'),
});

const Register: React.FC = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<IFormInputs> = (data) => {
        console.log(data);
        data.role = 'user';
        // Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(data));
        // Redireccionar a /home
        router.push('/home');
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
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

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

                <button
                    type="submit"
                    className="w-full bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-900"
                >
                    Registrarse
                </button>
            </form>
        </div>
    );
};

export default Register;