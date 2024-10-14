import Image from 'next/image';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 shadow-md bg-stone-400/30">
            <div className="container mx-auto px-4 py-2 flex items-center justify-center">
                <Image
                    src="/images/logoArtesanias.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="mr-2"
                />
                <h1 className="text-2xl font-bold text-gray-800">Artesanías Bogotá Ltda.</h1>
            </div>
        </header>
    );
};

export default Header;