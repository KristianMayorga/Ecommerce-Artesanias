'use client'

import React, {useEffect} from 'react';
import Login from "@/app/components/Login";
import {useAuth} from "@/app/context/AuthContext";
import {useRouter} from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const RegisterPage: React.FC = () => {

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

    if (!user) {
        return (
            <div className="justify-center w-full p-4">
                <Login/>
            </div>
        );
    }

    return null;
};

export default RegisterPage;