import type { Metadata } from "next";
import { Rethink_Sans } from 'next/font/google'
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Providers from "@/app/providers";

const rethink = Rethink_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
    title: "Artesanías Bogotá Ltda.",
    description: "Descubre la belleza de las artesanías bogotanas.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
        <body
            className={`${rethink.className} antialiased flex flex-col w-full min-h-screen bg-[#F4F6FF]`}
        >
        <Providers>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </Providers>
        </body>
        </html>
    );
}