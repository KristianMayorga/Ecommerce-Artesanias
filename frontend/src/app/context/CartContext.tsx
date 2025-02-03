import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Swal from "sweetalert2";
import {Product} from "@/app/types";

interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {

    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('shopping-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === product.id);

            if (existingItem) {
                if (existingItem.quantity >= product.amount) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Límite alcanzado',
                        text: `No puedes agregar más de ${product.amount} unidades de ${product.name}.`,
                    });
                    return currentItems;
                }
                // Si el producto ya existe, incrementar cantidad
                return currentItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems =>
            currentItems.filter(item => item.id !== productId)
        );
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(currentItems => {
            const itemToUpdate = currentItems.find(item => item.id === productId);

            if (itemToUpdate && quantity > itemToUpdate.amount) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cantidad no permitida',
                    text: `Excediste la cantidad máxima del producto.`,
                });
                return currentItems;
            }
            return currentItems.map(item =>
                item.id === productId
                    ? { ...item, quantity }
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