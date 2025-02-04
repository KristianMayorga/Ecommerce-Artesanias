'use client'

import { withAuth } from "@/app/context/AuthContext";
import ListaUsuarios from "@/app/components/ListaUsuarios";
import {ROLES} from "@/app/types";

function UserList() {

    return (
        <div className="container mx-auto px-4">
             <ListaUsuarios />
        </div>
    );
}

export default withAuth(UserList, [ROLES.ADMIN]);