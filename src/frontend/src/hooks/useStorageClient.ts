import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

let anonStorageClient: StorageClient | null = null;

export async function getAnonStorageClient(): Promise<StorageClient> {
  if (anonStorageClient) return anonStorageClient;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  anonStorageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  return anonStorageClient;
}

export function useStorageClient() {
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConfig().then((config) => {
      if (cancelled) return;
      const agent = new HttpAgent({ host: config.backend_host });
      setClient(
        new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return client;
}
