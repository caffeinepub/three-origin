import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Contact, Tshirt } from "../types";
import { useActor } from "./useActor";

export function useAllTshirts() {
  const { actor, isFetching } = useActor();
  return useQuery<Tshirt[]>({
    queryKey: ["tshirts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTshirts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWhatsappNumber() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["whatsapp"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        return await actor.getWhatsappNumber();
      } catch {
        return "";
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getContacts();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePaymentQR() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["paymentQR"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        const bytes = await actor.getPaymentQR();
        // bytes is a Uint8Array — convert to a data URL so the <img> can render it
        if (!bytes || bytes.length === 0) return "";
        const blob = new Blob([bytes as unknown as ArrayBuffer], {
          type: "image/png",
        });
        return URL.createObjectURL(blob);
      } catch {
        return "";
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTshirt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tshirt: Tshirt) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      return actor.addTshirt(tshirt);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tshirts"] }),
  });
}

export function useUpdateTshirt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tshirt: Tshirt) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      return actor.updateTshirt(tshirt);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tshirts"] }),
  });
}

export function useRemoveTshirt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      return actor.removeTshirt(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tshirts"] }),
  });
}

export function useSetWhatsapp() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (number: string) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      return actor.setWhatsappNumber(number);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp"] }),
  });
}

export function useAddContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Contact) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      return actor.addContact(contact);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useRemoveContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contactLabel: string) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      return actor.removeContact(contactLabel);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useSetPaymentQR() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bytes: Uint8Array<ArrayBuffer>) => {
      if (!actor)
        throw new Error(
          "Backend not ready — please wait a moment and try again",
        );
      // Backend takes raw Uint8Array directly — no ExternalBlob wrapping needed
      return actor.setPaymentQR(bytes);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentQR"] }),
  });
}

export function useGetCurrencyRates() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["currencyRates"],
    queryFn: async (): Promise<string | null> => {
      if (!actor) return null;
      try {
        // backend.ts unwraps the Candid opt and returns string | null directly
        return await actor.getCurrencyRates();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

export function useRefreshExchangeRates() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend not ready");
      return actor.refreshExchangeRates();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currencyRates"] }),
  });
}

export function useDetectUserCurrency() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (ip: string) => {
      if (!actor) return "INR";
      try {
        return await actor.detectUserCurrency(ip);
      } catch {
        return "INR";
      }
    },
  });
}
