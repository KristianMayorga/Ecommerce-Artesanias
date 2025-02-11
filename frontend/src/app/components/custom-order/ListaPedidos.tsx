'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useAuth } from "@/app/context/AuthContext";
import { CONST } from "@/app/constants";
import Swal from "sweetalert2";
import { Personalization, CategoryResponse } from "@/app/types";

export default function ListaPedidos() {
    const [orders, setOrders] = useState<Personalization[]>([]);
    const [categories, setCategories] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'aceptado' | 'rechazado'>('todos');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const { isAdmin, user, getToken } = useAuth();

    const loadCategories = useCallback(async () => {
        try {
            const response = await fetch(`${CONST.url}/categoriaProd/read-cp`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categoryData: CategoryResponse = await response.json();

            const categoriesMap = categoryData.cps.reduce((acc, category) => ({
                ...acc,
                [category._id]: category.name
            }), {});

            setCategories(categoriesMap);
        } catch (error) {
            console.error('Error fetching categories:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las categorías',
                icon: 'error',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });
        }
    }, []);

    const loadOrders = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No autorizado');
            }

            const response = await fetch(`${CONST.url}/personalization/read-personalizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los pedidos');
            }

            const data = await response.json();
            setOrders(data.personalizations);
        } catch (error) {
            console.error('Error loading orders:', error);
            await Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar los pedidos',
                icon: 'error',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        Promise.all([loadOrders(), loadCategories()]);
    }, [loadOrders, loadCategories]);

    const filteredOrders = useMemo(() => {
        let filtered = orders;
        if (statusFilter !== 'todos') {
            filtered = orders.filter(order => order.state === statusFilter);
        }
        if (!isAdmin) {
            filtered = filtered.filter(order => order.userId.email === user?.email);
        }
        return filtered;
    }, [orders, statusFilter, isAdmin, user?.email]);

    const updateOrderStatus = useCallback(async (orderId: string, newStatus: 'pendiente' | 'aceptado' | 'rechazado') => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No autorizado');
            }

            const response = await fetch(`${CONST.url}/personalization/update-personalization/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el estado');
            }

            await loadOrders();

            const messages = {
                pendiente: 'Pedido marcado como pendiente',
                aceptado: 'Pedido aprobado exitosamente',
                rechazado: 'Pedido rechazado'
            };

            await Swal.fire({
                title: '¡Éxito!',
                text: messages[newStatus],
                icon: 'success',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            await Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al actualizar el estado',
                icon: 'error',
                timer: 1500,
                position: 'top-end',
                toast: true,
                showConfirmButton: false
            });
        }
    }, [getToken, loadOrders]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-end items-center mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        className="px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'pendiente' | 'aceptado' | 'rechazado')}
                    >
                        <option value="todos">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="aceptado">Aceptados</option>
                        <option value="rechazado">Rechazados</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay pedidos que mostrar
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {order.userId.name} {order.userId.lastName}
                                    </h2>
                                    <p className="text-gray-600">
                                        Categoría: {categories[order.category] || 'Categoría N/A'}
                                    </p>
                                    <p className="text-gray-600">
                                        Presupuesto: ${order.budget.toFixed(2)}
                                    </p>
                                    <div className="mt-2">
                                        <StatusBadge status={order.state} />
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'aceptado')}
                                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                            disabled={order.state === 'aceptado'}
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'rechazado')}
                                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            disabled={order.state === 'rechazado'}
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() => setExpandedOrderId(
                                        expandedOrderId === order._id ? null : order._id
                                    )}
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                                >
                                    {expandedOrderId === order._id ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Menos detalles
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Más detalles
                                        </>
                                    )}
                                </button>
                            </div>

                            {expandedOrderId === order._id && (
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600">Email: {order.userId.email}</p>
                                            <p className="text-sm text-gray-600">Teléfono: {order.userId.phone}</p>
                                            <p className="text-sm text-gray-600">
                                                Fecha de pedido: {new Date(order.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Descripción:</p>
                                            <p className="text-sm text-gray-700">{order.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}