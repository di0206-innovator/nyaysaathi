import { IStorageAdapter } from './types';
import { MemoryStorageAdapter } from './adapters/memory-adapter';
import { SupabaseStorageAdapter } from './adapters/supabase-adapter';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/db/supabase';
import { MatterService } from './matter-service';

export * from './types';
export * from './adapters/memory-adapter';
export * from './adapters/supabase-adapter';
export * from './matter-service';

let activeAdapter: IStorageAdapter | null = null;
let activeService: MatterService | null = null;

export function getStorageAdapter(userToken?: string): IStorageAdapter {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient(userToken);
    if (!client) {
      throw new Error('Security Error: Unable to initialize Supabase storage client.');
    }
    return new SupabaseStorageAdapter(client);
  }
  if (!activeAdapter) {
    activeAdapter = new MemoryStorageAdapter();
  }
  return activeAdapter;
}

export function setStorageAdapter(adapter: IStorageAdapter): void {
  activeAdapter = adapter;
  if (activeService) {
    activeService.setAdapter(adapter);
  }
}

export function getMatterService(userToken?: string): MatterService {
  if (userToken && isSupabaseConfigured()) {
    return new MatterService(getStorageAdapter(userToken), userToken);
  }
  if (!activeService) {
    activeService = new MatterService(getStorageAdapter());
  }
  return activeService;
}
