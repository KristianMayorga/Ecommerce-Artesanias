"use client";

import { useEffect, useState } from "react";
import { UserCircle, Pencil, Trash2, Plus } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface UserData {
    name: string;
    email: string;
    password: string;
    role: "admin" | "cliente" | "vendedor";
}

const mockUsers: UserData[] = [
    {
        name: "Pepito Perez",
        email: "admin1@ejemplo.com",
        password: "Contraseña123!",
        role: "admin",
    },
    {
        name: "Patricio Estrella",
        email: "patricio123@ejemplo.com",
        password: "Contraseña123!",
        role: "cliente",
    },
    {
        name: "Juanito Juarez",
        email: "vendedorjuanito@ejemplo.com",
        password: "Contraseña123!",
        role: "vendedor",
    },
    {
        name: "Pepito Usuario",
        email: "usuario@ejemplo.com",
        password: "Contraseña123!",
        role: "cliente",
    },
];

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    const [formData, setFormData] = useState<UserData>({
        name: "",
        email: "",
        password: "",
        role: "cliente",
    });

    const syncWithLocalStorage = (updatedUsers: UserData[]) => {
        try {
            localStorage.setItem("users-data", JSON.stringify(updatedUsers));
            return true;
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            return false;
        }
    };

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

    useEffect(() => {
        const loadUsers = () => {
            try {
                const storedUsers = localStorage.getItem("users-data");
                if (storedUsers) {
                    setUsers(JSON.parse(storedUsers));
                } else {
                    setUsers(mockUsers);
                    syncWithLocalStorage(mockUsers);
                }
            } catch (error) {
                console.error("Error loading users:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, []);

    const handleOpenModal = (user: UserData | null) => {
        if (user) {
            setCurrentUser(user);
            setFormData(user);
        } else {
            setCurrentUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "cliente",
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let updatedUsers: UserData[] = [];

        if (currentUser) {
            updatedUsers = users.map((user) =>
                user.email === currentUser.email ? formData : user
            );
        } else {
            updatedUsers = [...users, formData];
        }

        if (syncWithLocalStorage(updatedUsers)) {
            setUsers(updatedUsers);
            handleCloseModal();
        }
    };

    const handleDelete = (email: string) => {
        const updatedUsers = users.filter((user) => user.email !== email);
        if (syncWithLocalStorage(updatedUsers)) {
            setUsers(updatedUsers);
        }
    };

    if (isLoading) {
        return (
            <LoadingSpinner/>
        );
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
                    <div key={user.email} className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <UserCircle size={40} className="text-gray-400" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-600">{user.name}</h2>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </div>
                        <div
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClasses(
                                user.role
                            )} mb-4`}
                        >
                            {user.role}
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
                                onClick={() => handleDelete(user.email)}
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
                                    name="name"
                                    type="text"
                                    value={formData.name}
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
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">
                                    Contraseña
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    placeholder="********"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Rol</label>
                                <select
                                    name="role"
                                    value={formData.role}
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
