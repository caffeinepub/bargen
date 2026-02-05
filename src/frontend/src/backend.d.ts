import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ShopProfile {
    id: bigint;
    locationUrl: string;
    owner: Principal;
    name: string;
    distanceKm: number;
    address: string;
    rating: bigint;
    priceInfo: string;
    phone: string;
}
export type Time = bigint;
export interface ProductWithShopDetails {
    id: bigint;
    name: string;
    shop: ShopProfile;
    description: string;
    price: bigint;
}
export interface Message {
    id: bigint;
    to: Principal;
    content: string;
    from: Principal;
    productId: bigint;
    timestamp: Time;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    browseProductsWithShop(): Promise<Array<ProductWithShopDetails>>;
    createProduct(shopId: bigint, name: string, description: string, price: bigint): Promise<bigint>;
    createShopProfile(name: string, rating: bigint, address: string, distance: number, priceInfo: string, phone: string, locationUrl: string): Promise<bigint>;
    getAllShops(): Promise<Array<ShopProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCartItems(): Promise<Array<CartItem>>;
    getChatMessages(productId: bigint): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendBargainRequest(productId: bigint, desiredPrice: bigint, note: string | null): Promise<bigint>;
    sendMessage(to: Principal, content: string, productId: bigint): Promise<bigint>;
}
