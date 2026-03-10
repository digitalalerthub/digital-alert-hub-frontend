import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface Props {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: Props) => {
    return (
        <nav aria-label='breadcrumb' className='breadcrumb-nav'>
            <ol className='breadcrumb'>
                {items.map((item, index) => (
                    <li
                        key={index}
                        className={`breadcrumb-item ${!item.to ? 'active' : ''}`}
                        aria-current={!item.to ? 'page' : undefined}
                    >
                        {item.to ? (
                            <Link to={item.to} className='breadcrumb-link'>
                                {index === 0 && <i className='bi bi-house-door-fill me-2' />}
                                {item.label}
                            </Link>
                        ) : (
                            item.label
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;