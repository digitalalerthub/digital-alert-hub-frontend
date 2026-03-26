import api from './api';
import type { AlertCategoryCatalogItem } from '../types/AlertCategory';
import type { AlertStateCatalogItem } from '../types/AlertState';

const alertCatalogService = {
    listStates: async (): Promise<AlertStateCatalogItem[]> => {
        const { data } = await api.get<AlertStateCatalogItem[]>(
            '/catalogs/estados',
        );
        return data;
    },
    listCategories: async (): Promise<AlertCategoryCatalogItem[]> => {
        const { data } = await api.get<AlertCategoryCatalogItem[]>(
            '/catalogs/categorias',
        );
        return data;
    },
};

export default alertCatalogService;
