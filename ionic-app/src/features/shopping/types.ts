export interface ShoppingCategory {
    key: string;
    label: string;
    icon: string;
}

export const DEFAULT_CATEGORIES: ShoppingCategory[] = [
    { key: 'produce',   label: 'Produce',      icon: 'leafOutline' },
    { key: 'dairy',     label: 'Dairy & Eggs',  icon: 'eggOutline' },
    { key: 'meat',      label: 'Meat & Fish',   icon: 'fishOutline' },
    { key: 'bakery',    label: 'Bakery',        icon: 'pizzaOutline' },
    { key: 'frozen',    label: 'Frozen',        icon: 'snowOutline' },
    { key: 'beverages', label: 'Beverages',     icon: 'cafeOutline' },
    { key: 'pantry',    label: 'Pantry',        icon: 'layersOutline' },
    { key: 'household', label: 'Household',     icon: 'homeOutline' },
    { key: 'other',     label: 'Other',         icon: 'ellipsisHorizontalOutline' },
];

export function getCategory(key?: string): ShoppingCategory {
    return DEFAULT_CATEGORIES.find((c) => c.key === key) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}
