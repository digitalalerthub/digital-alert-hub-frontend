import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import alertCatalogService from '../services/alertCatalogService';
import type { AlertCategoryCatalogItem } from '../types/AlertCategory';
import { AlertCategoriesContext } from './AlertCategoriesContext';

const buildCategoryLabelById = (
    categorias: AlertCategoryCatalogItem[],
): Record<number, string> =>
    categorias.reduce<Record<number, string>>((acc, categoria) => {
        acc[categoria.id_categoria] =
            categoria.label || `Categoria ${categoria.id_categoria}`;
        return acc;
    }, {});

export const AlertCategoriesProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [categorias, setCategorias] = useState<AlertCategoryCatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCategories = useCallback(async () => {
        try {
            const data = await alertCatalogService.listCategories();
            if (Array.isArray(data) && data.length > 0) {
                setCategorias(data);
            }
        } catch {
            setCategorias([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    const value = useMemo(
        () => ({
            categorias,
            labelById: buildCategoryLabelById(categorias),
            isLoading,
        }),
        [categorias, isLoading],
    );

    return (
        <AlertCategoriesContext.Provider value={value}>
            {children}
        </AlertCategoriesContext.Provider>
    );
};
