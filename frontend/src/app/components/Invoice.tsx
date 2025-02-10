'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { CONST } from '@/app/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import {
    DataPayment,
    DataProductResponse,
    PaymentMethodAPI,
    PaymentMethodsResponse,
    POS,
    POSResponse,
    ProductDetail,
    ProductResponse
} from "@/app/types";

interface InvoiceProps {
    transactionId: string;
}

const Invoice: React.FC<InvoiceProps> = ({ transactionId }) => {
    const [invoiceData, setInvoiceData] = useState<DataPayment | null>(null);
    const [products, setProducts] = useState<Record<string, ProductResponse>>({});
    const [stores, setStores] = useState<Record<string, POS>>({});
    const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethodAPI>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInvoiceDetails = async () => {
            try {
                const response = await fetch(`${CONST.url}/payment/details/${transactionId}`);
                if (!response.ok) throw new Error('Failed to fetch invoice details');
                const data: DataPayment = await response.json();
                setInvoiceData(data);

                await Promise.all([
                    fetchProducts(data.productDetails),
                    fetchStores(),
                    fetchPaymentMethods()
                ]);
            } catch (error) {
                console.error('Error fetching invoice details:', error);
                setError('No se pudo cargar la factura');
            } finally {
                setIsLoading(false);
            }
        };

        if (transactionId) {
            fetchInvoiceDetails();
        }
    }, [transactionId]);

    const fetchProducts = async (productDetails: ProductDetail[]) => {
        try {
            const productPromises = productDetails.map(async (product) => {
                const response = await fetch(`${CONST.url}/product/read-product/${product.idProduct}`);
                if (!response.ok) throw new Error('Failed to fetch product');
                const data: DataProductResponse = await response.json();
                return { id: product.idProduct, product: data.data };
            });

            const productsData = await Promise.all(productPromises);
            const productsMap = productsData.reduce<Record<string, ProductResponse>>((acc, { id, product }) => {
                acc[id] = product;
                return acc;
            }, {});

            setProducts(productsMap);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await fetch(`${CONST.url}/pos/read-pos`);
            if (!response.ok) throw new Error('Failed to fetch stores');
            const data: POSResponse = await response.json();
            const storesMap = data.posList.reduce<Record<string, POS>>((acc, store) => {
                acc[store._id] = store;
                return acc;
            }, {});
            setStores(storesMap);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch(`${CONST.url}/mop/read-MOP`);
            if (!response.ok) throw new Error('Failed to fetch payment methods');
            const data: PaymentMethodsResponse = await response.json();
            const methodsMap = data.mops.reduce<Record<string, PaymentMethodAPI>>((acc, method) => {
                acc[method._id] = method;
                return acc;
            }, {});
            setPaymentMethods(methodsMap);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !invoiceData) {
        return (
            <div className="text-center p-6">
                <p className="text-red-500">{error || 'No se pudo cargar la factura'}</p>
            </div>
        );
    }

    const { invoice, transaction, productDetails } = invoiceData;
    const formattedDate = format(new Date(invoice.date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    const paymentMethod = paymentMethods[transaction.idMeansOP];

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="fixed bottom-4 right-4 flex gap-2 z-50">
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
                >
                    <Printer className="h-4 w-4" />
                    Imprimir / Descargar
                </button>
            </div>

            <div ref={invoiceRef} className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="relative w-48 h-20">
                        <Image
                            src="/images/LOGO-ARTESANIAS.png"
                            alt="Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-900">Factura de Compra</h1>
                        <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Número de Factura:</p>
                            <p className="font-medium text-gray-700">{invoice._id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">ID Transacción:</p>
                            <p className="font-medium text-gray-700">{transaction._id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Método de Pago:</p>
                            <p className="font-medium text-gray-700">{paymentMethod?.name || 'No disponible'}</p>
                        </div>
                    </div>
                </div>

                <table className="min-w-full mb-6">
                    <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Producto</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Cantidad</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Precio Unit.</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {productDetails.map((product) => {
                        const productInfo = products[product.idProduct];
                        const store = stores[product.idPOS];

                        return (
                            <tr key={product.idProduct} className="border-b border-gray-200">
                                <td className="py-3 px-4">
                                    <p className="font-medium text-gray-900">
                                        {productInfo?.name || 'Producto no encontrado'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {store?.name || 'Tienda no encontrada'}
                                    </p>
                                </td>
                                <td className="text-center py-3 px-4 text-gray-700">{product.quantity}</td>
                                <td className="text-center py-3 px-4 text-gray-700">
                                    ${productInfo?.unitPrice?.toLocaleString()}
                                </td>
                                <td className="text-right py-3 px-4 text-gray-700">
                                    ${((productInfo?.unitPrice || 0) * product.quantity).toLocaleString()}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                <div className="border-t pt-4">
                    <div className="flex flex-col items-end space-y-2">
                        <div className="flex justify-between w-64">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-700">
                                ${(invoice.total - invoice.totalTax).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between w-64">
                            <span className="text-gray-600">IVA (19%):</span>
                            <span className="font-medium text-gray-700">
                                ${invoice.totalTax.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between w-64 text-lg font-bold border-t pt-2 text-gray-700 ">
                            <span>Total:</span>
                            <span>${invoice.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
                    <p>Gracias por tu compra</p>
                    <p>Para cualquier consulta, por favor guarda el número de factura: {invoice._id}</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;