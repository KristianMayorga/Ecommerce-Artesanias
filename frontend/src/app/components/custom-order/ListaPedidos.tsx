'use client';

import {useCallback, useEffect, useMemo, useState } from "react";
import {ChevronDown, ChevronUp, Filter, ImageIcon} from "lucide-react";
import {CustomOrder, OrderStatus} from "./types";
import StatusBadge from "./StatusBadge";
import AdminControls from "./AdminControls";
import OrderComments from "./OrderComments";
import Link from "next/link";

export default function ListaPedidos() {
    const [orders, setOrders] = useState<CustomOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const [userData, setUserData] = useState<{ role: string; email: string } | null>(null);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
        loadOrders();
    }, []);

    const isAdmin = useMemo(() => userData?.role === 'admin', [userData]);

    const filteredOrders = useMemo(() => {
        let filtered = orders;
        if (statusFilter !== 'todos') {
            filtered = orders.filter(order => order.status === statusFilter);
        }
        if (!isAdmin) {
            filtered = filtered.filter(order => order.email === userData?.email);
        }
        return filtered;
    }, [orders, statusFilter, isAdmin, userData?.email]);

    const loadOrders = useCallback(() => {
        const storedOrders = localStorage.getItem('pedidos-personalizados');
        if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
        }
        setLoading(false);
    }, []);

    const showNotification = useCallback((message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    }, []);

    const updateOrderStatus = useCallback((orderId: number, newStatus: OrderStatus) => {
        setOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order =>
                order.orderId === orderId ? { ...order, status: newStatus } : order
            );
            localStorage.setItem('pedidos-personalizados', JSON.stringify(updatedOrders));
            return updatedOrders;
        });

        const messages = {
            pendiente: 'Pedido marcado como pendiente',
            aceptado: 'Pedido aprobado exitosamente',
            rechazado: 'Pedido rechazado'
        };
        showNotification(messages[newStatus]);
    }, [showNotification]);

    const addComment = useCallback((orderId: number, commentText: string) => {
        setOrders(prevOrders => {
            const updatedOrders = prevOrders.map(order => {
                if (order.orderId === orderId) {
                    const comments = order.comments || [];
                    return {
                        ...order,
                        comments: [
                            ...comments,
                            {
                                text: commentText,
                                date: new Date().toISOString(),
                                author: isAdmin ? 'admin' : 'cliente'
                            }
                        ]
                    };
                }
                return order;
            });
            localStorage.setItem('pedidos-personalizados', JSON.stringify(updatedOrders));
            return updatedOrders;
        });
        showNotification('Comentario agregado');
    }, [isAdmin, showNotification]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {notification && (
                <div className="mb-4 p-4 rounded-lg bg-blue-50 text-blue-700 transition-opacity">
                    {notification}
                </div>
            )}

            <div className="flex justify-end items-center mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        className="px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'todos')}
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
                        <div key={order.orderId} className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {order.customerName}
                                    </h2>
                                    <p className="text-gray-600">
                                        Categoría: {order.category}
                                    </p>
                                    <p className="text-gray-600">
                                        Presupuesto: ${order.budget.toFixed(2)}
                                    </p>
                                    <div className="mt-2">
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isAdmin && (
                                        <AdminControls
                                            orderId={order.orderId}
                                            onStatusUpdate={updateOrderStatus}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() => setExpandedOrderId(
                                        expandedOrderId === order.orderId ? null : order.orderId
                                    )}
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                                >
                                    {expandedOrderId === order.orderId ? (
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

                            {expandedOrderId === order.orderId && (
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600">Email: {order.email}</p>
                                            <p className="text-sm text-gray-600">Teléfono: {order.phone}</p>
                                            <p className="text-sm text-gray-600">
                                                Fecha de pedido: {new Date(order.orderDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Fecha preferida: {new Date(order.preferredDeadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Descripción:</p>
                                            <p className="text-sm text-gray-700">{order.description}</p>
                                            {order.specialRequirements && (
                                                <>
                                                    <p className="text-sm text-gray-600 mt-2">Requisitos especiales:</p>
                                                    <p className="text-sm text-gray-700">{order.specialRequirements}</p>
                                                </>
                                            )}
                                            {order.referenceImage && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-600">Imagen de referencia:</p>
                                                    <div className={"flex text-gray-800 my-2"}>
                                                        <ImageIcon />
                                                        <Link href={order.referenceImage} target={"_blank"}>Link a la Imagen</Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <OrderComments
                                        comments={order.comments}
                                        orderId={order.orderId}
                                        onAddComment={addComment}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}