import { createContext } from 'react';
import type { AlertCategoryCatalogItem } from '../types/AlertCategory';

export interface AlertCategoriesContextValue {
    categorias: AlertCategoryCatalogItem[];
    labelById: Record<number, string>;
    isLoading: boolean;
}

export const AlertCategoriesContext =
    createContext<AlertCategoriesContextValue | null>(null);
