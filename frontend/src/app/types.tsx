export interface UserData {
    role: 'cliente' | 'admin' | 'vendedor';
    password?: string;
    email: string;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    amount: number;
}


