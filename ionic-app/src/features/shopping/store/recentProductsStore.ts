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
    clearHistory: () => void;
}

const MAX_PRODUCTS = 15;

export const useRecentProductsStore = create<RecentProductsState>()(
    persist(
        (set) => ({
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
            clearHistory: () => set({ products: [] }),
        }),
        {
            name: 'dotodo-recent-products',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
