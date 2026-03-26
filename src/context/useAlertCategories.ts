import { useContext } from 'react';
import { AlertCategoriesContext } from './AlertCategoriesContext';

export const useAlertCategories = () => {
    const context = useContext(AlertCategoriesContext);

    if (!context) {
        throw new Error(
            'useAlertCategories debe usarse dentro de un AlertCategoriesProvider',
        );
    }

    return context;
};
