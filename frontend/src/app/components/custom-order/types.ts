export type OrderStatus = 'pendiente' | 'aceptado' | 'rechazado';

export interface Comment {
    text: string;
    date: string;
    author: string;
}

export interface CustomOrder {
    orderId: number;
    customerName: string;
    email: string;
    phone: string;
    category: string;
    description: string;
    budget: number;
    preferredDeadline: string;
    referenceImage?: string;
    specialRequirements?: string;
    status: OrderStatus;
    orderDate: string;
    comments?: Comment[];
}