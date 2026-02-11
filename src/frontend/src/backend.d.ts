import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface VerificationLabel {
    labelText: string;
    description: string;
}
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
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export type Time = bigint;
export interface DeliveryOrder {
    id: bigint;
    status: DeliveryStatus;
    driverId?: bigint;
    completionCode: string;
    shopId: bigint;
    deliveryFee: bigint;
    dropoffLocation: string;
    customer: Principal;
    deliveryOption: DeliveryOption;
    timestamp: Time;
    pickupLocation: string;
}
export interface Insurance {
    premium: bigint;
    name: string;
    details: string;
    coverageAmount: bigint;
}
export interface CartTotal {
    total: bigint;
    insurance?: Insurance;
    cartItems: Array<CartItem>;
    insurancePremium: bigint;
    subtotal: bigint;
}
export interface ShopkeeperNotification {
    action: ShopkeeperAction;
    user: Principal;
    productId: bigint;
    timestamp: Time;
}
export interface ProductWithShopDetails {
    id: bigint;
    age?: ProductAge;
    photoBlobs?: Array<ExternalBlob>;
    returnPolicy: string;
    name: string;
    shop: ShopProfile;
    description: string;
    productVerificationLabels: Array<VerificationLabel>;
    price: bigint;
    listingQualityScore?: bigint;
    condition: Condition;
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
export interface BargainRequest {
    id: bigint;
    status: string;
    customer: Principal;
    shopkeeper: Principal;
    note?: string;
    productId: bigint;
    desiredPrice: bigint;
    timestamp: Time;
    mutuallyAccepted: boolean;
}
export type ProductAgeTime = {
    __kind__: "days";
    days: bigint;
} | {
    __kind__: "months";
    months: bigint;
} | {
    __kind__: "brandNew";
    brandNew: null;
} | {
    __kind__: "unknown";
    unknown: null;
} | {
    __kind__: "years";
    years: bigint;
};
export interface Product {
    id: bigint;
    age?: ProductAge;
    photoBlobs?: Array<ExternalBlob>;
    shopId: bigint;
    returnPolicy: string;
    name: string;
    description: string;
    productVerificationLabels: Array<VerificationLabel>;
    price: bigint;
    listingQualityScore?: bigint;
    condition: Condition;
}
export interface ProductAge {
    time: ProductAgeTime;
    conditionDescription: string;
}
export enum Condition {
    new_ = "new",
    used = "used"
}
export enum DeliveryOption {
    pickup = "pickup",
    delivery = "delivery"
}
export enum DeliveryStatus {
    driver_pending_assignment = "driver_pending_assignment",
    pending = "pending",
    in_transit = "in_transit",
    completed = "completed",
    driver_assigned = "driver_assigned",
    delivered = "delivered",
    picking_up = "picking_up",
    failed = "failed"
}
export enum ShopkeeperAction {
    liked = "liked",
    in_cart = "in_cart"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptBargain(bargainId: bigint): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bargainsByProduct(productId: bigint): Promise<Array<BargainRequest>>;
    browseProductsWithShop(): Promise<Array<ProductWithShopDetails>>;
    calculateDeliveryFee(shopId: bigint, distanceKm: number): Promise<bigint>;
    createProduct(shopId: bigint, name: string, description: string, price: bigint, photoBlobs: Array<ExternalBlob> | null, condition: Condition, returnPolicy: string, age: ProductAge | null, productVerificationLabels: Array<VerificationLabel>): Promise<bigint>;
    createShopProfile(name: string, rating: bigint, address: string, distance: number, priceInfo: string, phone: string, locationUrl: string): Promise<bigint>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllShops(): Promise<Array<ShopProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCartItems(): Promise<Array<CartItem>>;
    getCartTotalWithInsurance(): Promise<CartTotal>;
    getChatMessages(productId: bigint): Promise<Array<Message>>;
    getDefaultInsuranceOptions(): Promise<Array<Insurance>>;
    getOwnDeliveryOrders(): Promise<Array<DeliveryOrder>>;
    getOwnShopProfiles(): Promise<Array<ShopProfile>>;
    getProduct(productId: bigint): Promise<ProductWithShopDetails | null>;
    getProductsForShop(shopId: bigint): Promise<Array<ProductWithShopDetails>>;
    getSelectedInsurance(): Promise<Insurance | null>;
    getShopkeeperNotifications(shopId: bigint): Promise<Array<ShopkeeperNotification>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWishlist(): Promise<Array<Product>>;
    hasLikedProduct(productId: bigint): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    likeProduct(productId: bigint): Promise<void>;
    recommendBestInsurance(cartTotal: bigint): Promise<Insurance | null>;
    registerDeliveryPartner(name: string, vehicleType: string, location: string): Promise<bigint>;
    removeLike(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selectInsurance(insurance: Insurance | null): Promise<void>;
    sendBargainRequest(productId: bigint, desiredPrice: bigint, note: string | null): Promise<bigint>;
    sendMessage(to: Principal, content: string, productId: bigint): Promise<bigint>;
    setDeliveryPartnerAvailability(partnerId: bigint, isAvailable: boolean): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, price: bigint, photoBlobs: Array<ExternalBlob> | null, condition: Condition, returnPolicy: string, age: ProductAge | null, productVerificationLabels: Array<VerificationLabel>, listingQualityScore: bigint | null): Promise<void>;
}
