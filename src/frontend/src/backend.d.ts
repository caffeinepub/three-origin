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
export interface Tshirt {
    name: string;
    description: string;
    imageKey: string;
    price: string;
    deliveryCharge: string;
}
export interface backendInterface {
    addTshirt(tshirt: Tshirt): Promise<void>;
    getAllTshirts(): Promise<Array<Tshirt>>;
    getPaymentQR(): Promise<ExternalBlob>;
    getTshirt(name: string): Promise<Tshirt>;
    getWhatsappNumber(): Promise<string>;
    removeTshirt(name: string): Promise<void>;
    searchTshirts(term: string): Promise<Array<Tshirt>>;
    setPaymentQR(blob: ExternalBlob): Promise<void>;
    setWhatsappNumber(number: string): Promise<void>;
}
