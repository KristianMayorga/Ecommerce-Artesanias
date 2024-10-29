'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeAdmin from "@/app/components/HomeAdmin";
import HomeClient from "@/app/components/HomeClient";
import HomePOS from "@/app/components/HomePOS";
import {UserData} from "@/app/types";
import {CartProvider} from "@/app/context/CartContext";

export default function Home() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        console.log(storedUserData);
        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData) as UserData;
                setUserData(parsedUserData);
            } catch (error) {
                console.error('Error parsing userData:', error);
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    if (!userData) {
        return null; // This will prevent any flash of content before redirecting
    }

    return (
        <CartProvider>
        <div className="container mx-auto px-4">
            {userData.role === 'admin' &&  <HomeAdmin name={userData.name}/>}
            {userData.role === 'vendedor' && <HomePOS name={userData.name} />}
            {userData.role === 'cliente' && <HomeClient name={userData.name} />}
        </div>
        </CartProvider>
    );
}