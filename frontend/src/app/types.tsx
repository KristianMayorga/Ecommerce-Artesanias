export const ROLES = {
    ADMIN: 'Administrador',
    CLIENT: 'Cliente',
    POS: 'Vendedor'
}

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

export interface UserDataResponse {
    name: string;
    email?: string;
}

export interface ProductResponse {
    _id: string;
    name: string;
    unitPrice: number;
    category: string;
    description: string;
    state: boolean;
    image: string;
}

export interface POS {
    _id: string;
    name: string;
    city: string;
    state: boolean;
    adress: string;
    departament: number;
}

export interface POSResponse {
    posList: POS[];
}

export interface PaymentMethodAPI {
    _id: string;
    name: string;
    state: boolean;
}

export interface PaymentMethodsResponse {
    mops: PaymentMethodAPI[];
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

export interface EditProductFormInputs {
    name: string;
    unitPrice: number;
    category: string;
    description: string;
    image?: FileList;
    stocks: StocksByPOS;
}

export interface StocksByPOS {
    [posId: string]: StockData | undefined;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
}

export interface StockData {
    stockId?: string;
    amount?: number;
}

export interface Role {
    _id: string;
    state: boolean;
    name: string;
    __v?: number;
}

export interface RolesResponse {
    roles: Role[];
}

export interface UserData {
    _id: string;
    name: string;
    lastName: string;
    email: string;
    documentId: string;
    phone: number;
    adress: string;
    dateOfBirth: string;
    state: boolean;
    rol: Role;
    creationDate: string;
    pss?: string;
}

export interface Personalization {
    _id: string;
    category: string;
    state: 'pendiente' | 'aceptado' | 'rechazado';
    description: string;
    budget: number;
    userId: UserData;
    date: string;
}

export interface WishlistResponse {
    wl: WishlistItem[];
}

export interface WishlistItem {
    _id: string;
    productId: ProductResponse;
}

export interface CartItem extends Product {
    quantity: number;
    storeName: string;
    storeId: string;
}

export interface StoreGroup {
    storeName: string;
    items: CartItem[];
    subtotal: number;
}

export interface StoreGroups {
    [key: string]: StoreGroup;
}

export interface CartContextType {
    items: CartItem[];
    addToCart: (stock: Stock) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, posId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}