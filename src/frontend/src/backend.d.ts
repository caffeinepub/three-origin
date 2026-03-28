import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Tshirt {
    name: string;
    description: string;
    imageKey: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    addTshirt(tshirt: Tshirt): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdmin(): Promise<void>;
    getAllTshirts(): Promise<Array<Tshirt>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaymentQR(): Promise<string>;
    getTshirt(name: string): Promise<Tshirt>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWhatsappNumber(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    removeTshirt(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTshirts(term: string): Promise<Array<Tshirt>>;
    setPaymentQR(url: string): Promise<void>;
    setWhatsappNumber(number: string): Promise<void>;
}
