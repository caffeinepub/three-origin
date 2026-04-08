import type { ExternalBlob } from "../backend";

export interface Tshirt {
  name: string;
  description: string;
  imageKey: string;
  price: string;
  deliveryCharge: string;
  sizes: string[];
  colors: string[];
  stock: bigint;
}

export interface Contact {
  contactLabel: string;
  number: string;
}

export interface BackendActor {
  getAllTshirts(): Promise<Tshirt[]>;
  getTshirt(name: string): Promise<Tshirt>;
  searchTshirts(query: string): Promise<Tshirt[]>;
  addTshirt(tshirt: Tshirt): Promise<void>;
  updateTshirt(tshirt: Tshirt): Promise<void>;
  removeTshirt(name: string): Promise<void>;
  getWhatsappNumber(): Promise<string>;
  setWhatsappNumber(number: string): Promise<void>;
  getPaymentQR(): Promise<ExternalBlob>;
  setPaymentQR(blob: ExternalBlob): Promise<void>;
  getContacts(): Promise<Contact[]>;
  addContact(contact: Contact): Promise<void>;
  removeContact(contactLabel: string): Promise<void>;
  _initializeAccessControlWithSecret(token: string): Promise<void>;
}
