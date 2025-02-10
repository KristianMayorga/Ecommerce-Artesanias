'use client'

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import {useAuth} from "@/app/context/AuthContext";
import ListaDeseos from "@/app/components/ListaDeseos";
import {ROLES} from "@/app/types";
import ShoppingCart from "@/app/components/ShoppingCart";
import {Fragment} from "react";

export default function Home() {

    const { user} = useAuth();

    return (
        <ProtectedRoute>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {user?.role === ROLES.CLIENT && (
                    <Fragment>
                        <div className="lg:col-span-2 px-8">
                             <ListaDeseos />
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-20 p-8">
                                <ShoppingCart />
                            </div>
                        </div>
                    </Fragment>
                )}
            </div>
        </ProtectedRoute>
    );
}