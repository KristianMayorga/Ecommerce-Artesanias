import {Trash2, Plus, Minus, CreditCard} from 'lucide-react';
import Swal from 'sweetalert2';
import { useCart } from "@/app/context/CartContext";
import { useRouter } from 'next/navigation';
import {withAuth} from "@/app/context/AuthContext";
import {ROLES} from "@/app/types";


function ShoppingCart() {
    const router = useRouter();
    const {
        items,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount
    } = useCart();

    const handleRemoveItem = async (productId: string, productName: string) => {
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
            Swal.fire({
                title: 'Eliminado',
                text: 'El producto ha sido eliminado del carrito',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const handleClearCart = async () => {
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
            Swal.fire({
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
                <p className="text-gray-600">¡Agrega algunos productos para empezar!</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 min-w-[300px] shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </h2>
                <button
                    onClick={handleClearCart}
                    className="flex items-center text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-5 h-5 mr-2"/>
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div className="flex items-center flex-1">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.category}</p>
                                <span className="text-lg font-medium text-emerald-600 mt-1 block">
                                    ${item.price.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="text-gray-500 hover:text-gray-700"
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus className="w-5 h-5"/>
                                </button>
                                <span className="w-8 text-center font-medium text-gray-800">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <Plus className="w-5 h-5"/>
                                </button>
                            </div>

                            <span className="text-lg font-medium text-emerald-600 w-24 text-right">
                                ${(item.price * item.quantity).toLocaleString()}
                            </span>

                            <button
                                onClick={() => handleRemoveItem(item.id, item.name)}
                                className="ml-6 text-gray-400 hover:text-red-500"
                                aria-label="Eliminar producto"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-emerald-600">${totalAmount.toLocaleString()}</span>
                </div>
                <button
                    onClick={() => router.push('/checkout')}
                    className="w-full flex gap-2 items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors"
                >
                    <CreditCard size={20} />
                    Proceder al Pago
                </button>
            </div>
        </div>
    );
}

export default withAuth(ShoppingCart, [ROLES.CLIENT, ROLES.POS])