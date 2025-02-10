import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Swal from "sweetalert2";
import {CartContextType, CartItem, CategoryResponse, Stock, StockResponse} from "@/app/types";
import {CONST} from "@/app/constants";


const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {

    const [items, setItems] = useState<CartItem[]>([]);
    const [categories, setCategories] = useState<Record<string, string>>({});

    useEffect(() => {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }

        const fetchCategories = async () => {
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
            } catch (error) {
                console.error('Error fetching data:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo obtener la lista de categorías.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        localStorage.setItem('shopping-cart', JSON.stringify(items));
    }, [items]);

    const fetchAmount = async (productId: string, posId: string) => {
        try {
            const response = await fetch(`${CONST.url}/stock/read-stockProducto/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch POS list');
            }
            const data: StockResponse = await response.json();


            const currentStock = data.stocks.find(
                (stock) => stock.idProduct._id === productId && stock.idPOS._id === posId
            );

            return currentStock?.amount ?? 0;
        } catch (error) {
            console.error('Error fetching Stock Amount:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la cantidad de stock del producto.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return 0;
        }
    }

    const addToCart = async (stock: Stock) => {
        if(stock.amount <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Producto agotado',
                text: 'El producto seleccionado se encuentra agotado.',
            });
            return;
        }
        const amount = await fetchAmount(stock.idProduct._id, stock.idPOS._id);

        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === stock.idProduct._id);

            if (existingItem) {
                if (existingItem.quantity >= amount) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Límite alcanzado',
                        text: `No puedes agregar más de ${amount} unidades de ${stock.idProduct.name}.`,
                    });
                    return currentItems;
                }

                return currentItems.map(item =>
                    item.id === stock.idProduct._id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }

            const newCartItem: CartItem = {
                id: stock.idProduct._id,
                name: stock.idProduct.name,
                price: stock.idProduct.unitPrice,
                image: stock.idProduct.image,
                category: categories[stock.idProduct.category] ?? 'Sin categoría',
                quantity: 1,
                storeName: stock.idPOS.name,
                storeId: stock.idPOS._id,
            }

            return [...currentItems, newCartItem];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems =>
            currentItems.filter(item => item.id !== productId)
        );
    };

    const updateQuantity = async (productId: string, posId: string, quantity: number) => {
        if (quantity < 1) return;

        const amount = await fetchAmount(productId, posId);

        setItems(currentItems => {
            const itemToUpdate = currentItems.find(item => item.id === productId);

            if (itemToUpdate && quantity > amount) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Límite alcanzado',
                    text: `Excediste la cantidad máxima del producto.`,
                });
                return currentItems;
            }
            return currentItems.map(item =>
                item.id === productId
                    ? {...item, quantity}
                    : item
            );
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalAmount
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}