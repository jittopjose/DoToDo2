import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface RecentProduct {
    title: string;
    lastUsed: number;
    useCount: number;
    category?: string;
}

interface RecentProductsState {
    products: RecentProduct[];
    recordUsage: (title: string, category?: string) => void;
    getSuggestions: () => RecentProduct[];
    clearHistory: () => void;
}

const MAX_PRODUCTS = 15;

const DAY_MS = 24 * 60 * 60 * 1000;

export function getRecencyWeight(lastUsed: number, now: number): number {
    const days = (now - lastUsed) / DAY_MS;
    if (days <= 1) return 1.0;
    if (days <= 7) return 0.8;
    if (days <= 30) return 0.5;
    return 0.2;
}

export function scoreProduct(p: RecentProduct, now: number = Date.now()): number {
    return p.useCount * getRecencyWeight(p.lastUsed, now);
}

export const useRecentProductsStore = create<RecentProductsState>()(
    persist(
        (set, get) => ({
            products: [],
            recordUsage: (title, category?) =>
                set((state) => {
                    const trimmed = title.trim();
                    if (!trimmed) return state;
                    const lower = trimmed.toLowerCase();
                    const existing = state.products.find((p) => p.title.toLowerCase() === lower);
                    let updated: RecentProduct[];
                    if (existing) {
                        updated = state.products.map((p) =>
                            p.title.toLowerCase() === lower
                                ? { ...p, lastUsed: Date.now(), useCount: p.useCount + 1, category: category ?? p.category }
                                : p,
                        );
                    } else {
                        updated = [...state.products, { title: trimmed, lastUsed: Date.now(), useCount: 1, category }];
                    }
                    updated.sort((a, b) => b.lastUsed - a.lastUsed);
                    if (updated.length > MAX_PRODUCTS) {
                        updated = updated.slice(0, MAX_PRODUCTS);
                    }
                    return { products: updated };
                }),
            getSuggestions: () => {
                const now = Date.now();
                return [...get().products].sort((a, b) => scoreProduct(b, now) - scoreProduct(a, now));
            },
            clearHistory: () => set({ products: [] }),
        }),
        {
            name: 'dotodo-recent-products',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
