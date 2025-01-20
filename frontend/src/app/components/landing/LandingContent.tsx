'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Link from "next/link";

export default function Landing() {
    const categories = [
        { name: 'Cerámica', image: '/assets/images/ceramica.webp' },
        { name: 'Textiles', image: '/assets/images/textiles.webp' },
        { name: 'Joyería', image: '/assets/images/joyeria.webp' },
        { name: 'Madera', image: '/assets/images/madera.webp' },
        { name: 'Metal', image: '/assets/images/metal.webp' },
        { name: 'Vidrio', image: '/assets/images/vidrio.webp' },
    ];

    const STORES = [
        { id: '1', name: 'Tienda Centro', address: 'Carrera 7 #10-20, Bogotá, Colombia' },
        { id: '2', name: 'Tienda Norte', address: 'Avenida Carrera 9 #140-15, Bogotá, Colombia' },
        { id: '3', name: 'Tienda Sur', address: 'Calle 19 Sur #15-30, Bogotá, Colombia' },
    ];

    const [currentVideo, setCurrentVideo] = useState('/assets/video/landingA.mp4');

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    useEffect(() => {
        const videoCycle = setInterval(() => {
            setCurrentVideo((prev) => (prev === '/assets/video/landingA.mp4' ? '/assets/video/landingB.mp4' : '/assets/video/landingA.mp4'));
        }, 5000);

        return () => clearInterval(videoCycle);
    }, []);

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-blue-300">
            <video
                key={currentVideo}
                className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out"
                autoPlay
                loop
                muted
                playsInline>
                <source src={currentVideo} type="video/mp4" />
            </video>

            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 z-1"></div>

            <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center text-white px-6" data-aos="zoom-in">
                <h1 className="text-5xl md:text-7xl font-bold">Artesanías Únicas</h1>
                <p className="mt-4 text-lg md:text-2xl">Hechas a mano con amor y tradición</p>
            </div>

            <section className="relative z-10 py-16 bg-blue-400/50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 mb-8" data-aos="fade-up">Explora nuestras categorías</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {categories.map((category, index) => (
                            <Link href="/register" key={index}>
                            <div
                                key={index}
                                className="relative w-full pt-[100%] bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-blue-500"
                                data-aos="zoom-in"
                            >
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="absolute inset-0 w-full h-full"
                                />
                                <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-2">
                                    {category.name}
                                </div>
                            </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-16 bg-neutral-100 text-gray-800">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-8" data-aos="fade-up">Sobre Nosotros</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6" data-aos="fade-up">
                        <Image src="/assets/images/artesanosLanding.webp" width={400} height={300} className="rounded-lg shadow-lg" alt="Artesanos colombianos" />

                        <p className="text-lg md:text-xl text-justify max-w-lg">
                            En nuestra tienda, celebramos la riqueza cultural de Colombia a través de artesanías únicas.
                            Trabajamos directamente con talentosos artesanos de todo el país para ofrecer piezas auténticas
                            que reflejan la historia, el arte y la pasión de nuestra gente.<br /><br />
                            Desde los coloridos tejidos wayuu hasta la cerámica de Ráquira, cada producto cuenta una historia.
                            Apoyamos el comercio justo y fomentamos el arte tradicional para que nunca desaparezca.
                            Descubre la esencia de Colombia en cada una de nuestras creaciones.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-16 bg-blue-100 text-gray-800">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-8" data-aos="fade-up">Nuestras Tiendas</h2>
                    <p className="text-lg md:text-xl text-center mb-6" data-aos="fade-up">
                        Visítanos en cualquiera de nuestras ubicaciones en Bogotá y descubre nuestras artesanías en persona.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STORES.map((store) => (
                            <div key={store.id} className="p-6 bg-white shadow-lg rounded-lg text-center" data-aos="fade-up">
                                <h3 className="text-2xl font-bold mb-2">{store.name}</h3>
                                <p className="text-gray-700">{store.address}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
