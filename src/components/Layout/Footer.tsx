import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../App.css';

const IconLocation: React.FC = () => (
    <svg viewBox='0 0 24 24' width='16' height='16' fill='#e03030'>
        <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
    </svg>
);

const IconEmail: React.FC = () => (
    <svg viewBox='0 0 24 24' width='16' height='16' fill='#e03030'>
        <path d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' />
    </svg>
);

const IconPhone: React.FC = () => (
    <svg viewBox='0 0 24 24' width='16' height='16' fill='#e03030'>
        <path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' />
    </svg>
);

const IconFacebook: React.FC = () => (
    <svg viewBox='0 0 24 24' width='22' height='22' fill='#1877F2'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
    </svg>
);

const IconInstagram: React.FC = () => (
    <svg viewBox='0 0 24 24' width='22' height='22'>
        <defs>
            <linearGradient id='ig-grad' x1='0%' y1='100%' x2='100%' y2='0%'>
                <stop offset='0%' stopColor='#f09433' />
                <stop offset='50%' stopColor='#dc2743' />
                <stop offset='100%' stopColor='#bc1888' />
            </linearGradient>
        </defs>
        <path
            fill='url(#ig-grad)'
            d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
        />
    </svg>
);

const IconGithub: React.FC = () => (
    <svg viewBox='0 0 24 24' width='22' height='22' fill='white'>
        <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' />
    </svg>
);

const IconX: React.FC = () => (
    <svg viewBox='0 0 24 24' width='22' height='22' fill='white'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
    </svg>
);

interface ContactItem {
    label: string;
    Icon: React.FC;
}

interface SocialLink {
    name: string;
    url: string;
    Icon: React.FC;
}

const contactItems: ContactItem[] = [
    { label: 'Medellín, Colombia', Icon: IconLocation },
    { label: 'digitalalerthub@gmail.com', Icon: IconEmail },
    { label: '+57 300 000 0000', Icon: IconPhone },
];

const socialLinks: SocialLink[] = [
    { name: 'Facebook', url: '#', Icon: IconFacebook },
    { name: 'Instagram', url: '#', Icon: IconInstagram },
    { name: 'GitHub', url: '#', Icon: IconGithub },
    { name: 'X / Twitter', url: '#', Icon: IconX },
];

const Footer: React.FC = () => {
    return (
        <footer className='footer-section text-light'>
            <Container>
                <div className='footer-top-heading text-center'>
                    <h4 className='footer-main-title'>
                        Mantente conectado con Digital Alert Hub
                    </h4>
                </div>

                <Row className='gy-5 py-4 align-items-start'>
                    <Col md={4} className='text-center'>
                        <div className='footer-brand-block'>
                            <Link to='/register' className='footer-logo-link'>
                                <img
                                    src='/logoSinFondo.png'
                                    alt='Digital Alert Hub Logo'
                                    className='footer-logo'
                                />
                            </Link>

                            <p className='footer-brand-text'>
                                La red inteligente de alertas ciudadanas.
                            </p>
                        </div>
                    </Col>

                    <Col md={4} className='text-center'>
                        <h6 className='text-uppercase fw-bold mb-4 letter-spacing-wide'>
                            Contacto
                        </h6>

                        {contactItems.map((item, i) => (
                            <div
                                key={i}
                                className='d-flex align-items-center justify-content-center gap-3 mb-3 footer-contact-item'
                            >
                                <div className='footer-contact-icon'>
                                    <item.Icon />
                                </div>
                                <span className='footer-contact-text'>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </Col>

                    <Col md={4} className='text-center'>
                        <div className='footer-social-wrapper'>
                            <h6 className='text-uppercase fw-bold mb-4 letter-spacing-wide'>
                                Síguenos
                            </h6>

                            <div className='social-grid'>
                                {socialLinks.map((item, i) => (
                                    <a
                                        key={i}
                                        href={item.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='social-card-btn'
                                    >
                                        <item.Icon />
                                        <span>{item.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className='text-center pt-4 pb-3 border-top footer-separator footer-copy'>
                    © {new Date().getFullYear()} Digital Alert Hub — Todos los
                    derechos reservados.
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
