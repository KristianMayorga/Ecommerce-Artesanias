// Login
export interface ILoginInputs {
    email: string;
    pss: string;
}

export interface LoginResponse {
    error: boolean;
    token: string;
    rol: RoleResponse;
    id: string;
}

export interface RoleResponse {
    state: string;
    name: string;
}

export interface IUserData {
    usuarios: UserDataResponse;
}

interface UserDataResponse {
    name: string;
    email?: string;
}

// Lista Productos
interface ProductResponse {
    _id: string;
    name: string;
    unitPrice: number;
    category: string;
    description: string;
    state: boolean;
    image: string;
}

export interface Stock {
    _id: string;
    amount: number;
    idProduct: ProductResponse;
}

export interface StockResponse {
    stocks: Stock[];
}

export interface Category {
    _id: string;
    state: boolean;
    name: string;
}

export interface CategoryResponse {
    cps: Category[];
}

export interface ProductListProps {
    isAdmin?: boolean;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    amount: number;
}

