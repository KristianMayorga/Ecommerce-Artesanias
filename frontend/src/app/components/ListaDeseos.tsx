import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart, Trash2, PackageX } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { StockResponse, WishlistItem, WishlistResponse } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import { CONST } from "@/app/constants";

export default function ListaDeseos() {
    const [wishes, setWishes] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch(`${CONST.url}/wishlist/read-wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch wishlist');
                }

                const data: WishlistResponse = await response.json();
                const validWishes = data.wl.filter(item => item.productId !== null);
                setWishes(validWishes);
            } catch (error) {
                console.error('Error loading wishlist:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al cargar la lista de deseos',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchWishlist();
    }, [getToken]);

    const fetchStock = async (productId: string) => {
        try {
            const response = await fetch(`${CONST.url}/stock/read-stockProducto/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch POS list');
            }
            const data: StockResponse = await response.json();

            const currentStock = data.stocks.find(
                (stock) => stock.idProduct._id === productId
            );

            if (currentStock){
                return currentStock.amount > 0 ? currentStock : null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching Stock Amount:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la cantidad de stock del producto.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    }

    const handleDelete = async (wishId: string) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esta acción",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const response = await fetch(`${CONST.url}/wishlist/delete-wishList/${wishId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete wishlist item');
                }

                setWishes(prevWishes => prevWishes.filter(wish => wish._id !== wishId));
                await Swal.fire(
                    '¡Eliminado!',
                    'El producto ha sido eliminado de tu lista de deseos.',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el producto',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const handleAddToCart = async (product: WishlistItem['productId']) => {
        const stock = await fetchStock(product._id);

        if (!stock) {
            await Swal.fire({
                title: 'Error',
                text: 'No se encontró stock para el producto, intenta más tarde',
                icon: 'warning',
                confirmButtonText: 'Ok'
            });
            return;
        }

        addToCart(stock);
        await Swal.fire({
            title: '¡Agregado!',
            text: `${product.name} se ha agregado al carrito`,
            icon: 'success',
            timer: 1500,
            position: 'top-end',
            toast: true,
            showConfirmButton: false
        });
    };

    if (isLoading) {
        return (<LoadingSpinner/>);
    }

    if (wishes.length === 0) {
        return (
            <div className="py-8">
                <h1 className="text-3xl text-gray-800 font-bold mb-6">Mi lista de deseos</h1>
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
                    <PackageX size={64} className="text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600 text-center">Tu lista de deseos está vacía</p>
                    <p className="text-gray-500 text-center mt-2">Agrega productos a tu lista para verlos aquí</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <h1 className="text-3xl text-gray-800 font-bold mb-6">Mi lista de deseos</h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Producto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {wishes.map((wish) => (
                        <tr key={wish._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-16 w-16 flex-shrink-0">
                                        <Image
                                            src={wish.productId.image}
                                            alt={wish.productId.name}
                                            width={64}
                                            height={64}
                                            className="h-16 w-16 rounded-md object-cover"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-[#789DBC]">
                                            {wish.productId.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{wish.productId.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-emerald-700">
                                    ${wish.productId.unitPrice.toLocaleString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleAddToCart(wish.productId)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <ShoppingCart size={16} className="mr-2" />
                                        Agregar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(wish._id)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}