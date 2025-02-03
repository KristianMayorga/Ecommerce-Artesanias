export const ROLES = {
    ADMIN: 'Administrador',
    CLIENT: 'Cliente',
    POS: 'Vendedor'
}

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


interface POS {
    _id: string;
    name: string;
    city: string;
    state: boolean;
    adress: string;
    departament: number;
}

export interface Stock {
    _id: string;
    amount: number;
    idProduct: ProductResponse;
    idPOS: POS;
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

// Crear Producto
export interface ProductFormInputs {
    name: string;
    unitPrice: number;
    quali: number;
    category: string;
    description: string;
    image: FileList;
    amount: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    amount: number;
}

// Editar Producto
export type StockFormField = {
    amount: number;
    stockId?: string;
};