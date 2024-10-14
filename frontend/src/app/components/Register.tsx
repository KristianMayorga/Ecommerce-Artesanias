'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

interface IFormInputs {
    nombre: string;
    correo: string;
    contraseña: string;
}

const schema = yup.object().shape({
    nombre: yup.string().required('El nombre es obligatorio'),
    correo: yup
        .string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo válido.')
        .required('El correo es obligatorio'),
    contraseña: yup
        .string()
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
        )
        .required('La contraseña es obligatoria'),
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
        // Guardar en localStorage
        localStorage.setItem('userData', JSON.stringify(data));
        // Redireccionar a /home
        router.push('/home');
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white/50 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block mb-1 font-medium">Nombre</label>
                    <input
                        id="nombre"
                        type="text"
                        {...register('nombre')}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                </div>

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