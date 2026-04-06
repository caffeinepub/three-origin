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
export interface Contact {
    number: string;
    contactLabel: string;
}
export interface Tshirt {
    deliveryCharge: string;
    name: string;
    description: string;
    sizes: Array<string>;
    stock: bigint;
    imageKey: string;
    colors: Array<string>;
    price: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContact(contact: Contact): Promise<void>;
    addTshirt(tshirt: Tshirt): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllTshirts(): Promise<Array<Tshirt>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContacts(): Promise<Array<Contact>>;
    getPaymentQR(): Promise<ExternalBlob>;
    getTshirt(name: string): Promise<Tshirt>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWhatsappNumber(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    removeContact(contactLabel: string): Promise<void>;
    removeTshirt(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTshirts(term: string): Promise<Array<Tshirt>>;
    setPaymentQR(blob: ExternalBlob): Promise<void>;
    setWhatsappNumber(number: string): Promise<void>;
}
