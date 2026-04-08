import { useActor as useCaffeineActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { BackendActor } from "../types";

// createActorFunction<T> from core-infrastructure uses ExternalBlob from @caffeineai/object-storage.
// Our backend's createActor uses the local ExternalBlob — structurally identical, so we cast.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createBackendActor = createActor as unknown as Parameters<
  typeof useCaffeineActor<BackendActor>
>[0];

// No Internet Identity needed — actor is created anonymously.
// Admin access is password-based (OBS1314), not identity-based.
export function useActor() {
  return useCaffeineActor<BackendActor>(createBackendActor);
}
