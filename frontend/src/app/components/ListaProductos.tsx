import {useEffect, useState} from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

const mockProducts: Product[] = [
    { id: 1, name: "Jarrón de Barro Decorado", price: 89.99, image: "https://placehold.co/600x400", category: "Cerámica" },
    { id: 2, name: "Plato Decorativo Talavera", price: 45.99, image: "https://placehold.co/600x400", category: "Cerámica" },
    { id: 3, name: "Taza Artesanal", price: 24.99, image: "https://placehold.co/600x400", category: "Cerámica" },
    { id: 4, name: "Maceta Pintada a Mano", price: 34.99, image: "https://placehold.co/600x400", category: "Cerámica" },
    { id: 5, name: "Reboso Tejido", price: 129.99, image: "https://placehold.co/600x400", category: "Textiles" },
    { id: 6, name: "Tapete Bordado", price: 79.99, image: "https://placehold.co/600x400", category: "Textiles" },
    { id: 7, name: "Huipil Tradicional", price: 159.99, image: "https://placehold.co/600x400", category: "Textiles" },
    { id: 8, name: "Cojín Bordado", price: 39.99, image: "https://placehold.co/600x400", category: "Textiles" },
    { id: 9, name: "Collar de Plata y Turquesa", price: 189.99, image: "https://placehold.co/600x400", category: "Joyería" },
    { id: 10, name: "Aretes de Filigrana", price: 45.99, image: "https://placehold.co/600x400", category: "Joyería" },
    { id: 11, name: "Pulsera Tejida con Piedras", price: 29.99, image: "https://placehold.co/600x400", category: "Joyería" },
    { id: 12, name: "Anillo de Cobre Martillado", price: 34.99, image: "https://placehold.co/600x400", category: "Joyería" },
    { id: 13, name: "Alebrijes Pintados", price: 69.99, image: "https://placehold.co/600x400", category: "Madera" },
    { id: 14, name: "Caja Tallada", price: 49.99, image: "https://placehold.co/600x400", category: "Madera" },
    { id: 15, name: "Máscaras Decorativas", price: 59.99, image: "https://placehold.co/600x400", category: "Madera" },
    { id: 16, name: "Porta Velas Tallado", price: 29.99, image: "https://placehold.co/600x400", category: "Madera" },
    { id: 17, name: "Canasta de Palma", price: 44.99, image: "https://placehold.co/600x400", category: "Cestería" },
    { id: 18, name: "Bolsa de Mimbre", price: 54.99, image: "https://placehold.co/600x400", category: "Cestería" },
    { id: 19, name: "Sombrero de Palma", price: 39.99, image: "https://placehold.co/600x400", category: "Cestería" },
    { id: 20, name: "Tapete de Fibras Naturales", price: 69.99, image: "https://placehold.co/600x400", category: "Cestería" },
    { id: 21, name: "Cuadro en Repujado", price: 79.99, image: "https://placehold.co/600x400", category: "Metal" },
    { id: 22, name: "Campana Decorativa", price: 49.99, image: "https://placehold.co/600x400", category: "Metal" },
];

interface ProductListProps {
    isAdmin?: boolean;
}

export default function ListaProductos({ isAdmin = false }: ProductListProps) {
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [isLoading, setIsLoading] = useState(true);

    // Función para sincronizar con localStorage
    const syncWithLocalStorage = (updatedProducts: Product[]) => {
        try {
            localStorage.setItem('lista-productos', JSON.stringify(updatedProducts));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    };

    // Efecto para cargar productos al montar el componente
    useEffect(() => {
        const loadProducts = () => {
            try {
                const storedProducts = localStorage.getItem('lista-productos');
                if (storedProducts) {
                    setProducts(JSON.parse(storedProducts));
                    Swal.fire({
                        title: '¡Productos Cargados!',
                        text: 'Los productos se han cargado desde el almacenamiento local',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    syncWithLocalStorage(mockProducts);
                    setProducts(mockProducts);
                    Swal.fire({
                        title: 'Inicialización',
                        text: 'Se han cargado los productos iniciales',
                        icon: 'info',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error('Error loading products:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al cargar los productos',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    const handleEdit = (id: number) => {
        router.push('/edit/' + id);
    };

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
                const updatedProducts = products.filter(product => product.id !== id);
                const success = syncWithLocalStorage(updatedProducts);

                if (success) {
                    setProducts(updatedProducts);
                    Swal.fire(
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
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el producto',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-2 text-[#789DBC]">{product.name}</h2>
                        <p className="text-gray-600 mb-2">{product.category}</p>
                        <p className="text-lg font-bold text-emerald-700">${product.price.toFixed(2)}</p>
                        {isAdmin && (
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleEdit(product.id)}
                                    className="bg-amber-200 hover:bg-amber-300 text-gray-600 font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="bg-red-400 hover:bg-red-500 text-gray-600 font-bold py-2 px-4 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}