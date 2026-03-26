import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import type { Alert } from '../../types/Alert';
import AlertDeleteConfirmModal from './AlertDeleteConfirmModal';
import AlertDetailModal from './AlertDetailModal';
import AlertEditModal from './AlertEditModal';
import AlertListSection from './AlertListSection';
import CreateAlertFormSection from './CreateAlertFormSection';
import { useAlertCreationForm } from './hooks/useAlertCreationForm';
import { useAlertMap } from './hooks/useAlertMap';
import { useAlertsManager } from './hooks/useAlertsManager';
import { useAuth } from '../../context/useAuth';
import { useAlertStates } from '../../context/useAlertStates';
import {
    findAlertStateIdByName,
    getCanonicalAlertStateNameById,
} from '../../config/alertStates';
import './CreateAlertWorkspace.css';

const CreateAlertWorkspace = () => {
    const { user, isAdmin } = useAuth();
    const { estados, labelById } = useAlertStates();
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [pendingDeleteAlert, setPendingDeleteAlert] = useState<Alert | null>(
        null,
    );
    const [deletingAlertId, setDeletingAlertId] = useState<number | null>(null);
    const selectedAlertStateName = selectedAlert
        ? getCanonicalAlertStateNameById(selectedAlert.id_estado, labelById)
        : null;
    const isOwnerSelectedAlert =
        Boolean(selectedAlert) && user?.id === selectedAlert?.id_usuario;
    const isSelectedAlertEvidenceOnly =
        Boolean(selectedAlert) &&
        !isAdmin &&
        isOwnerSelectedAlert &&
        selectedAlertStateName === 'en_progreso';
    const canEditSelectedAlert =
        Boolean(selectedAlert) &&
        (isAdmin ||
            (user?.id === selectedAlert?.id_usuario &&
                (selectedAlertStateName === 'pendiente' ||
                    selectedAlertStateName === 'en_progreso')));
    const canDeleteSelectedAlert =
        Boolean(selectedAlert) &&
        (isAdmin ||
            (user?.id === selectedAlert?.id_usuario &&
                selectedAlertStateName === 'pendiente'));
    const pendingStateId = findAlertStateIdByName(estados, 'pendiente');

    const {
        titulo,
        setTitulo,
        descripcion,
        setDescripcion,
        categoriaId,
        setCategoriaId,
        categorias,
        loadingCategories,
        prioridad,
        setPrioridad,
        ubicacion,
        setUbicacion,
        comunas,
        barrios,
        comunaId,
        barrioId,
        onComunaChange,
        setBarrioId,
        autoSelectAdministrativeLocation,
        loadingLocations,
        evidencias,
        fieldErrors,
        submitting,
        handleEvidenceChange,
        handleEvidenceDrop,
        submitAlert,
    } = useAlertCreationForm();

    const {
        mapContainerRef,
        selectedCoords,
        reverseLoading,
        locatingUser,
        forceCoordsOnSubmit,
        suggestions,
        suggestionsLoading,
        renderActiveAlertsOnMap,
        handleManualUbicacionChange,
        handleSelectSuggestion,
        verifyAddress,
        useMyLocation,
        handleAddressBlur,
        clearLocationSelection,
    } = useAlertMap({ ubicacion, setUbicacion, pendingStateId });

    const {
        alertsLoading,
        pagedAlerts,
        totalPages,
        search,
        currentPage,
        loadAlerts,
        handleUpdateAlert,
        handleDeleteAlert,
        onSearchChange,
        onPageChange,
    } = useAlertsManager({ renderActiveAlertsOnMap });

    useEffect(() => {
        void loadAlerts();
    }, [loadAlerts]);

    useEffect(() => {
        if (!selectedCoords) return;
        void autoSelectAdministrativeLocation(selectedCoords);
    }, [autoSelectAdministrativeLocation, selectedCoords]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submitAlert({
            selectedCoords,
            forceCoordsOnSubmit,
            onSuccess: async () => {
                clearLocationSelection();
                await loadAlerts();
            },
        });
    };

    const requestDeleteAlert = (alert: Alert) => {
        setPendingDeleteAlert(alert);
    };

    const cancelDeleteAlert = () => {
        if (deletingAlertId !== null) return;
        setPendingDeleteAlert(null);
    };

    const confirmDeleteAlert = async () => {
        if (!pendingDeleteAlert || deletingAlertId !== null) return;

        const alertToDelete = pendingDeleteAlert;

        try {
            setDeletingAlertId(alertToDelete.id_alerta);
            await handleDeleteAlert(alertToDelete.id_alerta, {
                onSuccess: () => {
                    if (selectedAlert?.id_alerta === alertToDelete.id_alerta) {
                        setSelectedAlert(null);
                    }

                    if (editingAlert?.id_alerta === alertToDelete.id_alerta) {
                        setEditingAlert(null);
                    }

                    setPendingDeleteAlert(null);
                },
            });
        } finally {
            setDeletingAlertId(null);
        }
    };

    return (
        <div className='create-alert-page'>
            <div className='create-alert-layout'>
                <Breadcrumb
                    items={[
                        { label: 'Panel Principal', to: '/admin' },
                        { label: 'Crear Alerta' },
                    ]}
                />

                <div className='create-alert-header-section'>
                    <div className='create-alert-title-section'>
                        <h1 className='create-alert-page-title'>
                            Gestión de Alertas
                        </h1>
                        <p className='create-alert-page-subtitle'>
                            Administra y controla las alertas del sistema
                        </p>
                    </div>
                </div>

                <div className='create-alert-shell'>
                    <CreateAlertFormSection
                        onSubmit={handleSubmit}
                        titulo={titulo}
                        onTituloChange={setTitulo}
                        descripcion={descripcion}
                        onDescripcionChange={setDescripcion}
                        categoriaId={categoriaId}
                        onCategoriaIdChange={setCategoriaId}
                        categorias={categorias}
                        loadingCategories={loadingCategories}
                        prioridad={prioridad}
                        onPrioridadChange={setPrioridad}
                        ubicacion={ubicacion}
                        onUbicacionChange={handleManualUbicacionChange}
                        onAddressBlur={handleAddressBlur}
                        suggestionsLoading={suggestionsLoading}
                        suggestions={suggestions}
                        onSelectSuggestion={handleSelectSuggestion}
                        onVerifyAddress={verifyAddress}
                        onUseMyLocation={useMyLocation}
                        reverseLoading={reverseLoading}
                        locatingUser={locatingUser}
                        comunas={comunas}
                        comunaId={comunaId}
                        onComunaChange={onComunaChange}
                        barrioId={barrioId}
                        barrios={barrios}
                        onBarrioChange={setBarrioId}
                        loadingLocations={loadingLocations}
                        mapContainerRef={mapContainerRef}
                        selectedCoords={selectedCoords}
                        submitting={submitting}
                        evidencias={evidencias}
                        fieldErrors={fieldErrors}
                        onEvidenceChange={handleEvidenceChange}
                        onEvidenceDrop={handleEvidenceDrop}
                    />

                    <AlertListSection
                        search={search}
                        onSearchChange={onSearchChange}
                        alertsLoading={alertsLoading}
                        pagedAlerts={pagedAlerts}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                        onSelectAlert={setSelectedAlert}
                        currentUserId={user?.id ?? null}
                        isAdmin={isAdmin}
                        onDeleteAlertRequest={requestDeleteAlert}
                    />
                </div>
            </div>
            {selectedAlert && (
                <AlertDetailModal
                    alert={selectedAlert}
                    canEdit={canEditSelectedAlert}
                    canDelete={canDeleteSelectedAlert}
                    editLabel={
                        isSelectedAlertEvidenceOnly
                            ? 'Agregar evidencia'
                            : 'Editar'
                    }
                    onEdit={() => setEditingAlert(selectedAlert)}
                    onDeleteRequest={requestDeleteAlert}
                    onClose={() => setSelectedAlert(null)}
                />
            )}
            {editingAlert && (
                <AlertEditModal
                    alert={editingAlert}
                    mode={
                        !isAdmin &&
                        user?.id === editingAlert.id_usuario &&
                        getCanonicalAlertStateNameById(
                            editingAlert.id_estado,
                            labelById,
                        ) === 'en_progreso'
                            ? 'evidence-only'
                            : 'full'
                    }
                    onClose={() => setEditingAlert(null)}
                    onSave={handleUpdateAlert}
                />
            )}
            {pendingDeleteAlert && (
                <AlertDeleteConfirmModal
                    alert={pendingDeleteAlert}
                    deleting={deletingAlertId === pendingDeleteAlert.id_alerta}
                    onCancel={cancelDeleteAlert}
                    onConfirm={() => void confirmDeleteAlert()}
                />
            )}
        </div>
    );
};

export default CreateAlertWorkspace;
