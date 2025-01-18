import {useEffect, useState} from 'react';
import Swal from 'sweetalert2';
import Image from "next/image";
import {useCart} from "@/app/context/CartContext";
import {Pencil, ShoppingCart, Trash2} from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {Product} from "@/app/types";

export default function ListaDeseos() {
    const [wishes, setWishes] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();


    // Función para sincronizar con localStorage
    const syncWithLocalStorage = (updatedWishes: Product[]) => {
        try {
            localStorage.setItem('lista-deseos', JSON.stringify(updatedWishes));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    };

    // Efecto para cargar productos al montar el componente
    useEffect(() => {
        const loadWishes = async () => {
            try {
                const storedWishes = localStorage.getItem('lista-deseos');
                if (storedWishes) {
                    setWishes(JSON.parse(storedWishes));
                } else {
                    syncWithLocalStorage([]);
                }
            } catch (error) {
                console.error('Error loading products:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al cargar los productos',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadWishes();
    }, []);


    const handleDelete = async (id: number) => {
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
                const updatedProducts = wishes.filter(wish => wish.id !== id);
                const success = syncWithLocalStorage(updatedProducts);

                if (success) {
                    setWishes(updatedProducts);
                    //TODO: Cambiar alerta por un toaster
                    await Swal.fire(
                        '¡Eliminado!',
                        'El producto ha sido eliminado.',
                        'success'
                    );
                } else {
                    throw new Error('Error al sincronizar con localStorage');
                }
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

    const handleAddToCart = async (product: Product) => {
        addToCart(product);
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

    return (
        <div className="py-8">
            <h1 className="text-3xl text-gray-800 font-bold mb-6">Mi lista de deseos</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishes.map((product) => (
                    <div key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        <Image src={product.image} alt={product.name} width={192} height={192}
                               className="w-full h-48 object-cover"/>
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2 text-[#789DBC]">{product.name}</h2>
                            <p className="text-gray-600 mb-2">{product.category}</p>
                            <p className="text-lg font-bold text-emerald-700">${product.price.toFixed(2)}</p>

                            <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="w-full flex items-center gap-2 justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        <ShoppingCart size={20}/>
                                        Agregar al Carrito
                                    </button>

                                    <div className="flex justify-between gap-2">
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-gray-100 font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={20}/>
                                            Eliminar
                                        </button>
                                    </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
            );
            }