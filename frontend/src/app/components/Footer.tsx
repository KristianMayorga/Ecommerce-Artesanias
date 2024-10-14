import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-gray-600 py-4 sticky bottom-0 w-full bg-teal-50/80">
            <div className="container mx-auto px-4 text-center">
                <p>&copy; {new Date().getFullYear()} Artesanías Bogotá Ltda. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;