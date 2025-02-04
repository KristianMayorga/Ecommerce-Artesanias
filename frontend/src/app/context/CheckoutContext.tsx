import React, { createContext, useContext, useState } from 'react';

type ShippingMethod = 'store' | 'delivery';
type PaymentMethod = string;

interface CheckoutContextType {
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    setShippingMethod: (method: ShippingMethod) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    shippingAddress: ShippingAddress;
    setShippingAddress: (address: ShippingAddress) => void;
    cardDetails: CardDetails;
    setCardDetails: (details: CardDetails) => void;
    selectedStore: string;
    setSelectedStore: (store: string) => void;
}

interface ShippingAddress {
    city: string;
    fullAddress: string;
    phone: string;
}

interface CardDetails {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('store');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [selectedStore, setSelectedStore] = useState('');
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        city: '',
        fullAddress: '',
        phone: ''
    });
    const [cardDetails, setCardDetails] = useState<CardDetails>({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    return (
        <CheckoutContext.Provider value={{
            shippingMethod,
            setShippingMethod,
            paymentMethod,
            setPaymentMethod,
            shippingAddress,
            setShippingAddress,
            cardDetails,
            setCardDetails,
            selectedStore,
            setSelectedStore
        }}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
}
