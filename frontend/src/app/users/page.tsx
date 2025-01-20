'use client'

import {useAuth, withAuth} from "@/app/context/AuthContext";
import ListaUsuarios from "@/app/components/ListaUsuarios";

function UserList() {

    return (
        <div className="container mx-auto px-4">
             <ListaUsuarios />
        </div>
    );
}

export default withAuth(UserList, ['admin'])