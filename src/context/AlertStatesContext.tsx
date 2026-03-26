import { createContext } from 'react';
import type { AlertStateCatalogItem } from '../types/AlertState';

export interface AlertStatesContextValue {
    estados: AlertStateCatalogItem[];
    labelById: Record<number, string>;
    isLoading: boolean;
}

export const AlertStatesContext =
    createContext<AlertStatesContextValue | null>(null);
