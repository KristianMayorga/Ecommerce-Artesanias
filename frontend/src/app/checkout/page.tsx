'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "@/app/context/CartContext";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { CONST } from "@/app/constants";
import Swal from "sweetalert2";

interface POS {
    _id: string;
    name: string;
    city: string;
    state: boolean;
    adress: string;
    departament: number;
}

interface POSResponse {
    posList: POS[];
}

interface PaymentMethodAPI {
    _id: string;
    name: string;
    state: boolean;
}

interface PaymentMethodsResponse {
    mops: PaymentMethodAPI[];
}

const PAYMENT_PORTALS = {
    CARD: "12345",
    CASH: "67890"
} as const;

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalAmount, clearCart } = useCart();
    const { getToken, getUserId } = useAuth();
    const {
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
    } = useCheckout();

    const [stores, setStores] = useState<POS[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodAPI[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const finalAmount = shippingMethod === 'delivery'
        ? totalAmount + 20000
        : totalAmount;

    const fetchStores = useCallback(async () => {
        try {
            const response = await fetch(`${CONST.url}/pos/read-pos`);
            if (!response.ok) throw new Error('Failed to fetch stores');

            const data: POSResponse = await response.json();
            const activeStores = data.posList.filter(store => store.state);
            setStores(activeStores);

            const uniqueCities = Array.from(new Set(activeStores.map(store => store.city)));
            setCities(uniqueCities);
        } catch (error) {
            console.error('Error fetching stores:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las tiendas',
                icon: 'error'
            });
        }
    }, []);

    const fetchPaymentMethods = useCallback(async () => {
        try {
            const response = await fetch(`${CONST.url}/mop/read-MOP`);
            if (!response.ok) throw new Error('Failed to fetch payment methods');

            const data: PaymentMethodsResponse = await response.json();
            setPaymentMethods(data.mops);

            if (!paymentMethod && data.mops.length > 0) {
                setPaymentMethod(data.mops[0]._id);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los métodos de pago',
                icon: 'error'
            });
        }
    }, [paymentMethod, setPaymentMethod]);

    useEffect(() => {
        fetchStores();
        fetchPaymentMethods();
    }, [fetchStores, fetchPaymentMethods]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const products = items.map(item => ({
                idProduct: item.id,
                quantity: item.quantity,
                idPOS: selectedStore
                    ? selectedStore
                    : stores[0]?._id
            }));

            const totalTax = finalAmount * 0.19;
            const selectedPaymentMethod = paymentMethods.find(pm => pm._id === paymentMethod);

            const paymentData = {
                idPayPortal: selectedPaymentMethod?.name === "Tarjeta" ? PAYMENT_PORTALS.CARD : PAYMENT_PORTALS.CASH,
                idMeansOP: paymentMethod,
                total: finalAmount,
                totalTax: totalTax,
                userId: getUserId(),
                products: products
            };

            const response = await fetch(`${CONST.url}/payment/process-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            await Swal.fire({
                title: '¡Compra exitosa!',
                text: 'Tu pedido ha sido procesado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });

            clearCart();
            router.push('/home');
        } catch (error) {
            console.error('Error processing payment:', error);
            await Swal.fire({
                title: 'Error',
                text: 'No se pudo procesar el pago',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isCardPayment = paymentMethods.find(pm => pm._id === paymentMethod)?.name === "Tarjeta";

    return (
        <div className="max-w-4xl mx-auto p-6 text-gray-800">
            <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                </div>
                                <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                        {shippingMethod === 'delivery' && (
                            <div className="flex justify-between items-center pt-4 border-t">
                                <p>Cargo por envío</p>
                                <p>$20.000</p>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-4 border-t">
                            <p className="font-bold">Total</p>
                            <p className="font-bold text-emerald-600">${finalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Método de envío</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className={`flex-1 p-4 border rounded-lg ${
                                    shippingMethod === 'store' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => setShippingMethod('store')}
                            >
                                Recoger en tienda
                            </button>
                            <button
                                type="button"
                                className={`flex-1 p-4 border rounded-lg ${
                                    shippingMethod === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => setShippingMethod('delivery')}
                            >
                                Envío a domicilio (+$20.000)
                            </button>
                        </div>

                        {shippingMethod === 'store' ? (
                            <div className="space-y-4">
                                <select
                                    value={selectedStore}
                                    onChange={(e) => setSelectedStore(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Selecciona una tienda</option>
                                    {stores.map(store => (
                                        <option key={store._id} value={store._id}>
                                            {store.name} - {store.adress}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <select
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Selecciona una ciudad</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Dirección completa"
                                    value={shippingAddress.fullAddress}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullAddress: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Teléfono de contacto"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Método de pago</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method._id}
                                    type="button"
                                    className={`flex-1 p-4 border rounded-lg ${
                                        paymentMethod === method._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                    }`}
                                    onClick={() => setPaymentMethod(method._id)}
                                >
                                    {method.name}
                                </button>
                            ))}
                        </div>

                        {isCardPayment && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Número de tarjeta"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                        className="p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVV"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                        className="p-2 border rounded"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nombre en la tarjeta"
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors disabled:bg-blue-300"
                >
                    {isLoading ? 'Procesando...' : 'Confirmar y pagar'}
                </button>
            </form>
        </div>
    );
}