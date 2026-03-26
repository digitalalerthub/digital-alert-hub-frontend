import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    buildAlertStateLabelById,
} from '../config/alertStates';
import alertCatalogService from '../services/alertCatalogService';
import type { AlertStateCatalogItem } from '../types/AlertState';
import { AlertStatesContext } from './AlertStatesContext';

export const AlertStatesProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [estados, setEstados] = useState<AlertStateCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadStates = useCallback(async () => {
        try {
            const data = await alertCatalogService.listStates();
            if (Array.isArray(data) && data.length > 0) {
                setEstados(data);
            }
        } catch {
            setEstados([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStates();
    }, [loadStates]);

    const value = useMemo(
        () => ({
            estados,
            labelById: buildAlertStateLabelById(estados),
            isLoading,
        }),
        [estados, isLoading],
    );

    return (
        <AlertStatesContext.Provider value={value}>
            {children}
        </AlertStatesContext.Provider>
    );
};
