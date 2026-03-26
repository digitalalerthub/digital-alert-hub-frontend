export const AUTO_REFRESH_MS = 60000;

export const normalizeReportText = (value?: string) =>
    (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

export const getEstadoChartColor = (label?: string) => {
    const normalizedLabel = normalizeReportText(label);

    if (normalizedLabel === 'falsa alerta') {
        return '#dc2626';
    }

    if (normalizedLabel === 'pendiente' || normalizedLabel === 'nueva') {
        return '#2563eb';
    }

    if (normalizedLabel === 'en progreso') {
        return '#f59e0b';
    }

    if (normalizedLabel === 'resuelta') {
        return '#10b981';
    }

    return '#8b5cf6';
};

export const getCurrentYear = () => new Date().getFullYear();

export const buildMonthOptions = (selectedYear?: string) => {
    const formatter = new Intl.DateTimeFormat('es-CO', {
        month: 'long',
        timeZone: 'UTC',
    });

    const numericYear = Number(selectedYear || String(getCurrentYear()));
    return Array.from({ length: 12 }, (_, index) => {
        const date = new Date(Date.UTC(numericYear, index, 1));
        const value = `${numericYear}-${String(index + 1).padStart(2, '0')}`;
        const label = formatter.format(date);

        return {
            value,
            label: label.charAt(0).toUpperCase() + label.slice(1),
        };
    });
};

export const formatReportDateTime = (value?: string) => {
    if (!value) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export const getReadableReportLocation = (value?: string) => {
    if (!value) return 'Sin direccion';
    const marker = ' | Punto en mapa:';
    return value.includes(marker) ? value.split(marker)[0].trim() : value;
};
