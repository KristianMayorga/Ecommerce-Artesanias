'use client';

import React from "react";
import {CheckoutProvider} from "@/app/context/CheckoutContext";
import {CartProvider} from "@/app/context/CartContext";
import {AuthProvider} from "@/app/context/AuthContext";

export default function Providers({ children } : { children: React.ReactNode }) {
    return(
        <AuthProvider>
            <CheckoutProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </CheckoutProvider>
        </AuthProvider>
    )
}