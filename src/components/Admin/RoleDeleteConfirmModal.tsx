import './RoleDeleteConfirmModal.css';

type Props = {
    roleName: string;
    deleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const RoleDeleteConfirmModal = ({
    roleName,
    deleting,
    onCancel,
    onConfirm,
}: Props) => {
    return (
        <div
            className='role-delete-backdrop'
            onClick={deleting ? undefined : onCancel}
        >
            <div
                className='role-delete-modal'
                role='dialog'
                aria-modal='true'
                aria-labelledby='role-delete-title'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='role-delete-icon-wrap'>
                    <i className='bi bi-exclamation-triangle-fill' />
                </div>

                <p className='role-delete-eyebrow'>Eliminar rol</p>
                <h3 id='role-delete-title' className='role-delete-title'>
                    Esta accion eliminara el rol del sistema
                </h3>
                <p className='role-delete-body'>
                    Se eliminara <strong>{roleName}</strong> y dejara de estar
                    disponible para asignacion.
                </p>

                <div className='role-delete-note'>
                    <i className='bi bi-info-circle-fill' />
                    <span>
                        Continúa solo si estás seguro de eliminar este rol.
                    </span>
                </div>

                <div className='role-delete-actions'>
                    <button
                        type='button'
                        className='role-delete-cancel-btn'
                        onClick={onCancel}
                        disabled={deleting}
                    >
                        Cancelar
                    </button>
                    <button
                        type='button'
                        className='role-delete-confirm-btn'
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleDeleteConfirmModal;
