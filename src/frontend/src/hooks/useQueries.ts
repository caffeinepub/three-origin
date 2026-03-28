import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      return actor.getPaymentQR();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor._initializeAccessControlWithSecret(secret);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["isAdmin"] }),
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).claimFirstAdmin();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["isAdmin"] }),
  });
}

export function useResetAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).resetAdmin();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["isAdmin"] }),
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
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.setPaymentQR(url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentQR"] }),
  });
}
