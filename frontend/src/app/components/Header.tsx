'use client'
import Image from 'next/image';
import {HomeIcon, LogOut, UserRound, UserRoundPlus} from 'lucide-react';
import {useAuth} from "@/app/context/AuthContext";
import {usePathname} from "next/navigation";
import Link from "next/link";

const Header = () => {
    const pathname = usePathname();
    const isHomePage = pathname === '/home' || pathname === '/login' || pathname === '/register' || pathname === "/";
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="sticky top-0 z-50 shadow-md bg-blue-300/90">
            <div className="container mx-auto px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-gray-800">
                <Link href={"/"} className="w-full sm:w-auto mb-4 sm:mb-0">
                    <div className="flex items-center justify-center sm:justify-start">
                        <Image
                            src="/images/LOGO-ARTESANIAS.png"
                            alt="Logo"
                            width={300}
                            height={40}
                            className="w-auto h-auto max-w-[200px] sm:max-w-[300px]"
                            priority
                        />
                    </div>
                </Link>

                <nav className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
                    {!isHomePage && (
                        <Link href="/home" className="w-full sm:w-auto">
                            <div className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                <HomeIcon size={20}/>
                                <span className="hidden sm:inline">Volver al Home</span>
                            </div>
                        </Link>
                    )}

                    {user && (
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    )}

                    {!user && !isAuthPage && (
                        <>
                            <Link href="/register" className="w-full sm:w-auto">
                                <div className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                    <UserRoundPlus size={20}/>
                                    <span className="hidden sm:inline">Registrarse</span>
                                </div>
                            </Link>

                            <Link href="/login" className="w-full sm:w-auto">
                                <div className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                    <UserRound size={20}/>
                                    <span className="hidden sm:inline">Iniciar Sesión</span>
                                </div>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;