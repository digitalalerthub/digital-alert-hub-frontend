import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './ReportesPage.css';

const ReportesPage = () => {
    return (
        <div className=''>
            <div className='reportes-page'>
                <div className='reportes-layout'>
                    <Breadcrumb
                        items={[
                            { label: 'Panel Principal', to: '/admin' },
                            { label: 'Reportes Power BI' },
                        ]}
                    />

                    {/* Header */}
                    <div className='reportes-header'>
                        <h1 className='reportes-title'>Reportes Power BI</h1>
                        <p className='reportes-subtitle'>
                            Visualiza los datos del sistema en tiempo real
                        </p>
                    </div>

                    {/* Card contenedor del iframe */}
                    <div className='reportes-card'>
                        <div className='reportes-embed-wrap'>
                            {/* Aquí va el iframe de Power BI cuando esté listo */}
                            <div className='reportes-placeholder'>
                                <i className='bi bi-bar-chart-line reportes-placeholder-icon' />
                                <h3>Reporte no disponible</h3>
                                <p>
                                    El reporte de Power BI estará disponible
                                    próximamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;
