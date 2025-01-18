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
    confirmPassword: string;
    phone: string;
    role: string;
}

const schema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras')
        .min(2, 'Debe tener al menos un nombre y un apellido')
        .max(50, 'El nombre es muy largo')
        .required('El nombre es obligatorio'),
    email: yup
        .string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo válido.')
        .required('El correo es obligatorio'),
    password: yup
        .string()
        .matches(
            /^(?=.*[0-9!@#$%^&]*)(?=\S+$).{6,}$/,
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y uno de los siguientes caracteres especiales: @, $, !, %, *, ?, &'
        )
        .required('La contraseña es obligatoria'),
    confirmPassword: yup
        .string()
        .required('Confirma la contraseña')
        .test('passwords-match', 'Las contraseñas no coinciden', function(value) {
            return value === this.parent.password;
        }),
    phone: yup
        .string()
        .matches(
            /^(?!.*(\d)\1{9})(?!1234567890)\d{10}$/,
            'El número debe tener 10 dígitos y no puede ser una secuencia repetitiva o simple'
        )
        .required('El número de teléfono es obligatorio'),
    role: yup.string().default('cliente'),
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
        data.role = 'cliente';
        // Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(data));
        // Redireccionar a /home
        router.push('/home');
        console.log(data);
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
                    <label htmlFor="phone" className="block mb-1 font-medium text-gray-800">Número de Celular</label>
                    <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
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

                <div>
                    <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-800">Confirmar
                        Contraseña</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.confirmPassword &&
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
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