"use client";

import React, { useEffect, useState } from "react";
import { UserCircle, Pencil, Trash2, Plus } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { CONST } from "@/app/constants";
import Swal from "sweetalert2";
import {useAuth} from "@/app/context/AuthContext";

interface UserData {
    id?: number;
    nombre: string;
    email: string;
    numero_de_celular: string;
    rol: "admin" | "cliente" | "vendedor";
    password?: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    const { getToken } = useAuth();

    const [formData, setFormData] = useState<UserData>({
        nombre: "",
        email: "",
        password: "",
        numero_de_celular: "",
        rol: "cliente",
    });

    const getRoleColorClasses = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800";
            case "vendedor":
                return "bg-blue-100 text-blue-800";
            case "cliente":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const fetchUsers = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${CONST.url}/accounts/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los usuarios',
                icon: 'error',
                position: 'top-end',
                toast: true,
                timer: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user: UserData | null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                ...user,
                password: ""
            });
        } else {
            setCurrentUser(null);
            setFormData({
                nombre: "",
                email: "",
                password: "",
                numero_de_celular: "",
                rol: "cliente",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            await Swal.fire({
                title: 'Error',
                text: 'No se encontró el token de autenticación',
                icon: 'error',
                position: 'top-end',
                toast: true,
                timer: 3000
            });
            return;
        }

        try {
            let response;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            if (currentUser) {
                const updateData = {
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: formData.rol,
                    numero_de_celular: formData.numero_de_celular
                };

                response = await fetch(`${CONST.url}/accounts/usuarios/${currentUser.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(updateData)
                });
            } else {
                response = await fetch(`${CONST.url}/accounts/usuarios`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {

                const res = await response.json();
                let err: string | undefined;
                if (res.email[0]){
                    err = res.email[0]
                }

                await Swal.fire({
                    title: 'Error',
                    text: err || 'No se pudo guardar el usuario',
                    icon: 'error',
                    position: 'top-end',
                    toast: true,
                    timer: 3000
                });

                throw new Error('Failed to save user');
            }

            await fetchUsers();
            handleCloseModal();

            await Swal.fire({
                title: 'Éxito',
                text: currentUser ? 'Usuario actualizado' : 'Usuario creado',
                icon: 'success',
                position: 'top-end',
                toast: true,
                timer: 3000
            });

        } catch (error) {
            console.log(error)
        }
    };

    const handleDelete = async (id: number) => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${CONST.url}/accounts/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            await fetchUsers();

            await Swal.fire({
                title: 'Éxito',
                text: 'Usuario eliminado',
                icon: 'success',
                position: 'top-end',
                toast: true,
                timer: 3000
            });

        } catch (error) {
            console.error('Error deleting user:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el usuario',
                icon: 'error',
                position: 'top-end',
                toast: true,
                timer: 3000
            });
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="py-8 px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl text-gray-800 font-bold">Gestión de Usuarios</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    <span>Agregar Usuario</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <UserCircle size={40} className="text-gray-400" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-600">{user.nombre}</h2>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-gray-500 text-sm">Tel: {user.numero_de_celular}</p>
                            </div>
                        </div>
                        <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClasses(
                                user.rol
                            )} mb-4`}
                        >
                            {user.rol}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleOpenModal(user)}
                                className="flex-1 flex items-center justify-center gap-2 bg-amber-200 hover:bg-amber-300 text-gray-600 font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                <Pencil size={16} />
                                <span>Editar</span>
                            </button>
                            <button
                                onClick={() => user.id && handleDelete(user.id)}
                                className="flex-1 flex items-center justify-center gap-2 text-white font-bold bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white w-11/12 max-w-md mx-auto p-6 rounded-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-600">
                            {currentUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Nombre</label>
                                <input
                                    name="nombre"
                                    type="text"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            {!currentUser && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-600">
                                        Contraseña
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!currentUser}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                        placeholder="********"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">
                                    Número de Celular
                                </label>
                                <input
                                    name="numero_de_celular"
                                    type="text"
                                    value={formData.numero_de_celular}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="0000000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Rol</label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="vendedor">Vendedor</option>
                                    <option value="cliente">Cliente</option>
                                </select>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    {currentUser ? "Guardar Cambios" : "Crear Usuario"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}