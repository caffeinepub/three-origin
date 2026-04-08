import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Contact {
    number: string;
    contactLabel: string;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    addContact(contact: Contact): Promise<void>;
    addTshirt(tshirt: Tshirt): Promise<void>;
    detectUserCurrency(userIp: string): Promise<string | null>;
    getAllTshirts(): Promise<Array<Tshirt>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getContacts(): Promise<Array<Contact>>;
    getCurrencyRates(): Promise<string | null>;
    getPaymentQR(): Promise<Uint8Array | null>;
    getRatesCachedAt(): Promise<bigint>;
    getTshirt(name: string): Promise<Tshirt | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWhatsappNumber(): Promise<string>;
    refreshExchangeRates(): Promise<boolean>;
    removeContact(contactLabel: string): Promise<void>;
    removeTshirt(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTshirts(term: string): Promise<Array<Tshirt>>;
    setPaymentQR(blob: Uint8Array): Promise<void>;
    setWhatsappNumber(number: string): Promise<void>;
    updateTshirt(tshirt: Tshirt): Promise<void>;
}
