import React, { useMemo } from 'react';
import { Trash2, Plus, Minus, CreditCard, Store } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from "@/app/context/CartContext";
import { useRouter } from 'next/navigation';
import { withAuth } from "@/app/context/AuthContext";
import {CartItem, ROLES, StoreGroups} from "@/app/types";

const ShoppingCart: React.FC = () => {
    const router = useRouter();
    const {
        items,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount
    } = useCart();

    const itemsByStore = useMemo<StoreGroups>(() => {
        return items.reduce<StoreGroups>((acc, item) => {
            if (!acc[item.storeId]) {
                acc[item.storeId] = {
                    storeName: item.storeName,
                    items: [],
                    subtotal: 0
                };
            }
            acc[item.storeId].items.push(item);
            acc[item.storeId].subtotal += item.price * item.quantity;
            return acc;
        }, {});
    }, [items]);

    const handleRemoveItem = async (productId: string, productName: string): Promise<void> => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: `¿Estás seguro de eliminar ${productName} del carrito?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            removeFromCart(productId);
            await Swal.fire({
                title: 'Eliminado',
                text: 'El producto ha sido eliminado del carrito',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const handleClearCart = async (): Promise<void> => {
        const result = await Swal.fire({
            title: '¿Vaciar carrito?',
            text: '¿Estás seguro de eliminar todos los productos del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            clearCart();
            await Swal.fire({
                title: 'Carrito vaciado',
                text: 'Se han eliminado todos los productos',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
                <p className="text-gray-600">¡Agrega algunas artesanías para empezar!</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {totalItems} {totalItems === 1 ? 'artesanía' : 'artesanías'}
                    </h2>
                    <button
                        onClick={handleClearCart}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        type="button"
                    >
                        <Trash2 className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            <div className="md:max-h-[calc(100vh-300px)] overflow-y-auto divide-y divide-gray-100">
                {Object.entries(itemsByStore).map(([storeId, storeData]) => (
                    <div key={storeId} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Store className="w-4 h-4 text-gray-500"/>
                            <h3 className="font-medium text-gray-700">{storeData.storeName}</h3>
                        </div>

                        <div className="space-y-3">
                            {storeData.items.map((item: CartItem) => (
                                <div key={item.id} className="flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                                            <p className="text-sm text-gray-500">{item.category}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(item.id, item.name)}
                                            className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-50"
                                            type="button"
                                            aria-label={`Eliminar ${item.name}`}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.storeId, item.quantity - 1)}
                                                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                                type="button"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus className="w-4 h-4"/>
                                            </button>
                                            <span className="w-8 text-center font-medium text-gray-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.storeId, item.quantity + 1)}
                                                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
                                                type="button"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                ${item.price.toLocaleString()} c/u
                                            </div>
                                            <div className="font-medium text-emerald-600">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal tienda</span>
                            <span className="font-medium text-gray-800">
                                ${storeData.subtotal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-emerald-600">
                        ${totalAmount.toLocaleString()}
                    </span>
                </div>
                <button
                    onClick={() => router.push('/checkout')}
                    className="w-full flex gap-2 items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    type="button"
                >
                    <CreditCard className="w-5 h-5" />
                    Proceder al Pago
                </button>
            </div>
        </div>
    );
};

export default withAuth(ShoppingCart, [ROLES.CLIENT, ROLES.POS]);