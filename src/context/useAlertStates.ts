import { useContext } from 'react';
import { AlertStatesContext } from './AlertStatesContext';

export const useAlertStates = () => {
    const context = useContext(AlertStatesContext);

    if (!context) {
        throw new Error(
            'useAlertStates debe usarse dentro de un AlertStatesProvider',
        );
    }

    return context;
};
