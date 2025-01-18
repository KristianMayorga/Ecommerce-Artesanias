'use client';

import FeatureList from "@/app/components/landing/FeatureList";
import AuthButtons from "@/app/components/landing/AuthButtons";

// Componente para el contenido de la landing
const LandingContent = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 gap-12 sm:p-16">
            <h1 className="text-4xl font-bold text-[#8B5E3C] text-center sm:text-left">
                Artesanías Bogotá Ltda.
            </h1>
            <p className="text-lg text-gray-700 text-center sm:text-left">
                Descubre la belleza de la artesanía colombiana
            </p>
            <FeatureList />
            <AuthButtons />
        </div>
    );
};

export default LandingContent;