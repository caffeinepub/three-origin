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
  // Backend stores QR as raw bytes — no ExternalBlob wrapping
  getPaymentQR(): Promise<Uint8Array>;
  setPaymentQR(blob: Uint8Array): Promise<void>;
  getContacts(): Promise<Contact[]>;
  addContact(contact: Contact): Promise<void>;
  removeContact(contactLabel: string): Promise<void>;
  _initializeAccessControlWithSecret(token: string): Promise<void>;
  // Multi-currency — backend.ts already unwraps the Candid opt to string | null
  getCurrencyRates(): Promise<string | null>;
  getRatesCachedAt(): Promise<bigint>;
  refreshExchangeRates(): Promise<string>;
  detectUserCurrency(ip: string): Promise<string>;
}
