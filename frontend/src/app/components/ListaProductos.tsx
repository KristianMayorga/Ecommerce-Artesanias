import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import {ChevronDown, Pencil, ShoppingCart, Trash2} from "lucide-react";
import { CONST } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { CategoryResponse, ProductListProps, Stock, StockResponse } from "@/app/types";

interface POS {
    _id: string;
    name: string;
    city: string;
    state: boolean;
    adress: string;
    departament: number;
    __v: number;
}

interface POSResponse {
    posList: POS[];
}

export default function ListaProductos({ isAdmin = false }: ProductListProps) {
    const router = useRouter();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [categories, setCategories] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [posList, setPosList] = useState<POS[]>([]);
    const [selectedPOS, setSelectedPOS] = useState<string>("");
    const { addToCart } = useCart();
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchPOSList = async () => {
            try {
                const response = await fetch(`${CONST.url}/pos/read-pos`);
                if (!response.ok) {
                    throw new Error('Failed to fetch POS list');
                }
                const data: POSResponse = await response.json();

                const activePOSList = data.posList.filter(pos => pos.state);
                setPosList(activePOSList);

                if (activePOSList.length > 0) {
                    setSelectedPOS(activePOSList[0]._id);
                }
            } catch (error) {
                console.error('Error fetching POS list:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los puntos de venta',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        };

        fetchPOSList();
    }, []);

    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
            if (!selectedPOS) return;

            setIsLoading(true);
            try {
                const categoryResponse = await fetch(`${CONST.url}/categoriaProd/read-cp`);
                if (!categoryResponse.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const categoryData: CategoryResponse = await categoryResponse.json();

                const categoriesMap = categoryData.cps.reduce((acc, category) => ({
                    ...acc,
                    [category._id]: category.name
                }), {});

                setCategories(categoriesMap);

                const productsResponse = await fetch(`${CONST.url}/stock/read-stockPOS/${selectedPOS}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!productsResponse.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data: StockResponse = await productsResponse.json();
                setStocks(data.stocks);
            } catch (error) {
                console.error('Error fetching data:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los productos',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoriesAndProducts();
    }, [selectedPOS]);

    const handleEdit = (id: string) => {
        router.push('/edit/' + id);
    };

    const handleDelete = async (stock: Stock) => {
        try {
            const result = await Swal.fire({
                title: '¿Qué deseas eliminar?',
                html: `
                    <p class="mb-4">Selecciona una opción para eliminar:</p>
                    <p class="text-sm text-gray-600 mb-4">Producto: ${stock.idProduct.name}</p>
                `,
                icon: 'warning',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Solo el Stock',
                denyButtonText: 'Stock y Producto',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3085d6',
                denyButtonColor: '#d33',
                cancelButtonColor: '#6e7881'
            });

            if (result.isDismissed) {
                return;
            }

            if (result.isConfirmed) {
                const stockResponse = await fetch(`${CONST.url}/stock/delete-stock/${stock._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`,
                    },
                });

                if (!stockResponse.ok) {
                    throw new Error('Failed to delete stock');
                }

                setStocks(stocks.filter(s => s._id !== stock._id));

                await Swal.fire({
                    title: '¡Stock Eliminado!',
                    text: 'El stock ha sido eliminado exitosamente.',
                    icon: 'success'
                });
            }

            if (result.isDenied) {
                const stockResponse = await fetch(`${CONST.url}/stock/delete-stock/${stock._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`,
                    },
                });

                const productResponse = await fetch(`${CONST.url}/product/delete-product/${stock.idProduct._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`,
                    },
                });

                if (!stockResponse.ok || !productResponse.ok) {
                    throw new Error('Failed to delete stock and product');
                }

                setStocks(stocks.filter(s => s.idProduct._id !== stock.idProduct._id));

                await Swal.fire({
                    title: '¡Eliminados!',
                    text: 'El stock y el producto han sido eliminados exitosamente.',
                    icon: 'success'
                });
            }
        } catch (error) {
            console.error('Error deleting:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo completar la eliminación',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const handleAddToCart = async (stock: Stock) => {
        const cartProduct = {
            id: stock.idProduct._id,
            name: stock.idProduct.name,
            price: stock.idProduct.unitPrice,
            image: stock.idProduct.image,
            category: categories[stock.idProduct.category] || 'Categoría N/A',
            amount: stock.amount
        };

        addToCart(cartProduct);
        await Swal.fire({
            title: '¡Agregado!',
            text: `${stock.idProduct.name} se ha agregado al carrito`,
            icon: 'success',
            timer: 1500,
            position: 'top-end',
            toast: true,
            showConfirmButton: false
        });
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="w-full max-w-md">
                <label htmlFor="pos-select" className="block text-sm font-medium text-gray-700  mb-2">
                    Seleccionar Punto de Venta
                </label>
                <div className="relative">
                    <select
                        id="pos-select"
                        value={selectedPOS}
                        onChange={(e) => setSelectedPOS(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 bg-white
                                 text-gray-900
                                 shadow-sm appearance-none
                                 hover:border-gray-400
                                 cursor-pointer"
                    >
                        {posList.map((pos) => (
                            <option
                                key={pos._id}
                                value={pos._id}
                                className="bg-white  text-gray-900 "
                            >
                                {pos.name} - {pos.city}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className={`w-4 h-4 text-gray-400 `} />
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
                {stocks.map((stock) => (
                    <div key={stock._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        <Image
                            src={stock.idProduct.image}
                            alt={stock.idProduct.name}
                            width={192}
                            height={192}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2 text-[#789DBC]">
                                {stock.idProduct.name}
                            </h2>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>{stock.idProduct.description}</span>
                            </div>
                            <p className="text-lg font-bold text-emerald-700">
                                ${stock.idProduct.unitPrice.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                {categories[stock.idProduct.category] || 'Categoría N/A'}
                            </p>

                            <div className="mt-4 space-y-2">
                                {!isAdmin && (
                                    <button
                                        onClick={() => handleAddToCart(stock)}
                                        className="w-full flex items-center gap-2 justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                        disabled={stock.amount === 0}
                                    >
                                        <ShoppingCart size={20} />
                                        {stock.amount === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                                    </button>
                                )}

                                {isAdmin && (
                                    <div className="flex justify-between gap-2">
                                        <button
                                            onClick={() => handleEdit(stock.idProduct._id)}
                                            className="flex items-center gap-2 bg-amber-200 hover:bg-amber-300 text-gray-600 font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            <Pencil size={20} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(stock)}
                                            className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-gray-100 font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={20} />
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}