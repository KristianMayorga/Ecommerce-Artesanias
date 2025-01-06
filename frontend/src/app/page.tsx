"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";
import LandingContent from "@/app/components/landing/LandingContent";
import {useAuth} from "@/app/context/AuthContext";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/home');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (<LoadingSpinner />);
    }

    if (!user){
        return <LandingContent />;
    }

    return null;
}
