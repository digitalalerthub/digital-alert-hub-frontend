import type { User } from '../../types/User';
import './UserStatusConfirmModal.css';

type Props = {
    user: User;
    processing: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const UserStatusConfirmModal = ({
    user,
    processing,
    onCancel,
    onConfirm,
}: Props) => {
    const willDeactivate = user.estado;

    return (
        <div
            className='user-status-backdrop'
            onClick={processing ? undefined : onCancel}
        >
            <div
                className='user-status-modal'
                role='dialog'
                aria-modal='true'
                aria-labelledby='user-status-title'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='user-status-icon-wrap'>
                    <i
                        className={`bi ${willDeactivate ? 'bi-person-x-fill' : 'bi-person-check-fill'}`}
                    />
                </div>

                <p className='user-status-eyebrow'>
                    {willDeactivate ? 'Inactivar usuario' : 'Activar usuario'}
                </p>
                <h3 id='user-status-title' className='user-status-title'>
                    {willDeactivate
                        ? 'Este usuario dejara de tener acceso activo'
                        : 'Este usuario volvera a tener acceso al sistema'}
                </h3>
                <p className='user-status-body'>
                    {willDeactivate ? 'Se inactivara ' : 'Se activara '}
                    <strong>
                        {user.nombre} {user.apellido}
                    </strong>
                    {'.'}
                </p>

                <div className='user-status-note'>
                    <i className='bi bi-info-circle-fill' />
                    <span>
                        {willDeactivate
                            ? 'Podrás volver a activarlo más adelante si lo necesitas.'
                            : 'El usuario podrá iniciar sesión nuevamente después de esta acción.'}
                    </span>
                </div>

                <div className='user-status-actions'>
                    <button
                        type='button'
                        className='user-status-cancel-btn'
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Cancelar
                    </button>
                    <button
                        type='button'
                        className='user-status-confirm-btn'
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing
                            ? 'Procesando...'
                            : willDeactivate
                              ? 'Sí, inactivar'
                              : 'Sí, activar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserStatusConfirmModal;
