import { Storage } from '@ionic/storage';

class StorageService {
    private _storage: Storage | null = null;
    private _initPromise: Promise<void> | null = null;

    async init() {
        if (this._storage) return;
        if (this._initPromise) return this._initPromise;

        this._initPromise = (async () => {
            // No explicit drivers needed for basic web/android usage; 
            // it defaults to [IndexedDB, LocalStorage, WebSQL]
            const storage = new Storage({
                name: '__dotodo_db'
            });
            this._storage = await storage.create();
        })();
        return this._initPromise;
    }

    async get(key: string) {
        await this.init();
        return this._storage?.get(key);
    }

    async set(key: string, value: any) {
        await this.init();
        return this._storage?.set(key, value);
    }

    async remove(key: string) {
        await this.init();
        return this._storage?.remove(key);
    }

    async clear() {
        await this.init();
        return this._storage?.clear();
    }
}

export const storageService = new StorageService();
