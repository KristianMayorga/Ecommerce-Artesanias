import Link from "next/link";

const AuthButtons = () => {
    return (
        <div className="flex gap-4 flex-col sm:flex-row">
            <Link
                href="/login"
                className="rounded-full bg-[#8B5E3C] text-white h-10 px-4 flex items-center justify-center transition-colors hover:bg-[#7A5333]"
            >
                Iniciar Sesión
            </Link>
            <Link
                href="/register"
                className="rounded-full border border-[#8B5E3C]/20 text-[#8B5E3C] h-10 px-4 flex items-center justify-center transition-colors hover:bg-[#8B5E3C]/10 hover:border-transparent"
            >
                Crear Cuenta
            </Link>
        </div>
    );
};

export default AuthButtons;