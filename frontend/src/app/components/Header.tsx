'use client'
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const isHomePage = pathname === '/home';

    const handleLogout = () => {
        localStorage.removeItem('userData');
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-50 shadow-md bg-[#789DBC]/90">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between text-gray-800">
                <div className="px-4 flex items-center">
                    <Image
                        src="/images/logoArtesanias.svg"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="mr-2"
                    />
                    <h1 className="text-2xl font-bold">Artesanías Bogotá Ltda.</h1>
                </div>

                {isHomePage && (
                    <div className="px-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;