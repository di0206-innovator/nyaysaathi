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

export function getStorageAdapter(): IStorageAdapter {
  if (!activeAdapter) {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      activeAdapter = new SupabaseStorageAdapter(client);
    } else {
      activeAdapter = new MemoryStorageAdapter();
    }
  }
  return activeAdapter;
}

export function setStorageAdapter(adapter: IStorageAdapter): void {
  activeAdapter = adapter;
  if (activeService) {
    activeService.setAdapter(adapter);
  }
}

export function getMatterService(): MatterService {
  if (!activeService) {
    activeService = new MatterService(getStorageAdapter());
  }
  return activeService;
}
