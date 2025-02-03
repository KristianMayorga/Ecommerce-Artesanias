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
            <div className="container mx-auto px-4 py-2 flex items-center justify-between text-gray-800">
                <Link href={"/home"}>
                    <div className="px-4 flex items-center">
                        <Image
                            src="/images/LOGO-ARTESANIAS.png"
                            alt="Logo"
                            width={300}
                            height={40}
                            className="mr-2"
                        />
                    </div>
                </Link>

                <div className={"flex justify-between"}>
                {!isHomePage && (
                    <div className="px-4">
                        <Link href="/home">
                            <div className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                <HomeIcon size={20}/>
                                    Volver al Home
                            </div>
                        </Link>
                    </div>
                    )}
                {user && (
                    <div className="px-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                    </div>
                )}
                    {!user && !isAuthPage && (
                        <div className="px-4 flex justify-between">
                            <Link href="/register">
                                <div className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                    <UserRoundPlus size={20}/>
                                    Registrarse
                                </div>
                            </Link>

                            <Link href="/login">
                                <div className="flex items-center gap-2 px-4 mx-2 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                    <UserRound size={20}/>
                                    Iniciar Sesión
                                </div>
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </header>
    );
};

export default Header;