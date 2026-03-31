import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { Tshirt } from "../backend.d";
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
      return actor.getWhatsappNumber();
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
      const blob = await actor.getPaymentQR();
      return blob.getDirectURL();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTshirt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tshirt: Tshirt) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addTshirt(tshirt);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tshirts"] }),
  });
}

export function useRemoveTshirt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
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
      if (!actor) throw new Error("Not authenticated");
      return actor.setWhatsappNumber(number);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp"] }),
  });
}

export function useSetPaymentQR() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bytes: Uint8Array<ArrayBuffer>) => {
      if (!actor) throw new Error("Not authenticated");
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.setPaymentQR(blob);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentQR"] }),
  });
}
