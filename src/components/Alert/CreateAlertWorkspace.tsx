import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import type { Alert } from "../../types/Alert";
import AlertDetailModal from "./AlertDetailModal";
import AlertEditModal from "./AlertEditModal";
import AlertListSection from "./AlertListSection";
import CreateAlertFormSection from "./CreateAlertFormSection";
import { useAlertCreationForm } from "./hooks/useAlertCreationForm";
import { useAlertMap } from "./hooks/useAlertMap";
import { useAlertsManager } from "./hooks/useAlertsManager";
import { useAuth } from "../../context/useAuth";
import "./CreateAlertWorkspace.css";

const CreateAlertWorkspace = () => {
  const { user } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    categoria,
    setCategoria,
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
    loadingLocations,
    evidencias,
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
  } = useAlertMap({ ubicacion, setUbicacion });

  const {
    alertsLoading,
    pagedAlerts,
    totalPages,
    search,
    currentPage,
    loadAlerts,
    handleUpdateAlert,
    onSearchChange,
    onPageChange,
  } = useAlertsManager({ renderActiveAlertsOnMap });

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

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

  return (
    <div className="create-alert-page">
      <div className="create-alert-layout">
        <nav aria-label="breadcrumb" className="create-alert-breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/admin" className="breadcrumb-link">
                <i className="bi bi-house-door me-2" />
                Panel Principal
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Gestion de Alertas
            </li>
          </ol>
        </nav>

        <div className="create-alert-header-section">
          <h1 className="create-alert-page-title">Gestion de Alertas</h1>
        </div>

        <div className="create-alert-shell">
          <CreateAlertFormSection
            onSubmit={handleSubmit}
            titulo={titulo}
            onTituloChange={setTitulo}
            descripcion={descripcion}
            onDescripcionChange={setDescripcion}
            categoria={categoria}
            onCategoriaChange={setCategoria}
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
          />
        </div>
      </div>
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          canEdit={user?.id === selectedAlert.id_usuario && selectedAlert.id_estado === 1}
          onEdit={() => setEditingAlert(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
        />
      )}
      {editingAlert && (
        <AlertEditModal
          alert={editingAlert}
          onClose={() => setEditingAlert(null)}
          onSave={handleUpdateAlert}
        />
      )}
    </div>
  );
};

export default CreateAlertWorkspace;
