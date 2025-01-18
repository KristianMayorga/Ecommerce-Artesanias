'use client';

import React from "react";
import {CheckoutProvider} from "@/app/context/CheckoutContext";
import {CartProvider} from "@/app/context/CartContext";

export default function Providers({ children } : { children: React.ReactNode }) {
    return(
        <CheckoutProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </CheckoutProvider>
    )
}