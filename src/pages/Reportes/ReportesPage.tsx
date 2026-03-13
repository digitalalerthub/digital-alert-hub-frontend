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
                            { label: 'Reporte Alertas' },
                        ]}
                    />

                    {/* Header */}
                    <div className='reportes-header'>
                        <h1 className='reportes-title'>Reporte Alertas</h1>
                        <p className='reportes-subtitle'>
                            Visualiza los datos del sistema en tiempo real
                        </p>
                    </div>

                    {/* Card contenedor del iframe */}
                    <div className='reportes-card'>
                        <div className='reportes-embed-wrap'>
                            {/* Aqui va el iframe del reporte cuando este listo */}
                            <div className='reportes-placeholder'>
                                <i className='bi bi-bar-chart-line reportes-placeholder-icon' />
                                <h3>Reporte no disponible</h3>
                                <p>
                                    El reporte de alertas estara disponible
                                    proximamente.
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
