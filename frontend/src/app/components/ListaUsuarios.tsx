"use client";

import React, { useEffect, useState } from "react";
import { UserCircle, Pencil, Trash2, Plus } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { CONST } from "@/app/constants";
import Swal from "sweetalert2";
import { useAuth } from "@/app/context/AuthContext";
import {ROLES} from "@/app/types";

interface Role {
    _id: string;
    state: boolean;
    name: string;
    __v?: number;
}

interface RolesResponse {
    roles: Role[];
}

interface UserData {
    _id: string;
    name: string;
    lastName: string;
    email: string;
    documentId: string;
    phone: number;
    adress: string;
    dateOfBirth: string;
    state: boolean;
    rol: Role;
    creationDate: string;
    pss?: string;
}

interface UserFormData {
    name: string;
    lastName: string;
    email: string;
    documentId: string;
    phone?: number;
    adress: string;
    dateOfBirth: string;
    pss?: string;
    rol?: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    const { getToken } = useAuth();

    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        lastName: "",
        email: "",
        documentId: "",
        phone: undefined,
        adress: "",
        dateOfBirth: "",
        pss: "",
        rol: "",
    });

    const getRoleColorClasses = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case ROLES.ADMIN:
                return "bg-red-100 text-red-800";
            case ROLES.POS:
                return "bg-blue-100 text-blue-800";
            case ROLES.CLIENT:
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

            const response = await fetch(`${CONST.url}/usuario/read-usuario`, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.usuarios);
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

    const fetchRoles = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${CONST.url}/rol/read-rol`, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }

            const data: RolesResponse = await response.json();
            setRoles(data.roles);
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    useEffect(() => {
        Promise.all([fetchUsers(), fetchRoles()]).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const handleOpenModal = (user: UserData | null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                documentId: user.documentId,
                phone: user.phone,
                adress: user.adress,
                dateOfBirth: new Date(user.dateOfBirth).toISOString().split('T')[0],
                pss: "",
                rol: user.rol._id
            });
        } else {
            setCurrentUser(null);
            setFormData({
                name: "",
                lastName: "",
                email: "",
                documentId: "",
                phone: undefined,
                adress: "",
                dateOfBirth: "",
                pss: "",
                rol: ""
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
            [name]: name === 'phone' ? Number(value) : value,
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
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            };

            const submitData = {
                ...formData,
                phone: Number(formData.phone)
            };

            if (currentUser) {
                response = await fetch(`${CONST.url}/usuario/update-usuario/${currentUser._id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(submitData)
                });
            } else {
                response = await fetch(`${CONST.url}/usuario/add-usuario`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(submitData)
                });
            }

            if (!response?.ok) {
                const errorData = await response?.json();
                await Swal.fire({
                    title: 'Error',
                    text: errorData?.message || 'No se pudo guardar el usuario',
                    icon: 'error',
                    position: 'top-end',
                    toast: true,
                    timer: 3000
                });
                return;
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
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id: string) => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${CONST.url}/usuario/delete-usuario/${id}`, {
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
                text: 'Usuario eliminado correctamente',
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
                    <div key={user._id} className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <UserCircle size={40} className="text-gray-400" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-600">{user.name} {user.lastName}</h2>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-gray-500 text-sm">Doc: {user.documentId}</p>
                                <p className="text-gray-500 text-sm">Tel: {user.phone}</p>
                                <p className="text-gray-500 text-sm">Dir: {user.adress}</p>
                            </div>
                        </div>
                        <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClasses(
                                user.rol.name
                            )} mb-4`}
                        >
                            {user.rol.name}
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
                                onClick={() => handleDelete(user._id)}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="relative bg-white w-11/12 max-w-md mx-auto my-8 p-6 rounded-md">
                        <div className="max-h-[80vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4 text-gray-600">
                                {currentUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Nombre</label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="Nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Apellido</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="Apellido"
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
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Documento de Identidad</label>
                                <input
                                    name="documentId"
                                    type="text"
                                    value={formData.documentId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="Número de documento"
                                />
                            </div>
                            {!currentUser && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-600">
                                        Contraseña
                                    </label>
                                    <input
                                        name="pss"
                                        type="password"
                                        value={formData.pss}
                                        onChange={handleInputChange}
                                        required={!currentUser}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                        placeholder="********"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">
                                    Teléfono
                                </label>
                                <input
                                    name="phone"
                                    type="number"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="3001234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">
                                    Dirección
                                </label>
                                <input
                                    name="adress"
                                    type="text"
                                    value={formData.adress}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="Dirección"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Rol</label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                >
                                    <option value="">Seleccione un rol</option>
                                    {roles.map((role) => (
                                        <option key={role._id} value={role._id}>
                                            {role.name}
                                        </option>
                                    ))}
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
                                    className="bg-blue-600 text-white px-4py-2 rounded-md hover:bg-blue-700"
                                >
                                    {currentUser ? "Guardar Cambios" : "Crear Usuario"}
                                </button>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}