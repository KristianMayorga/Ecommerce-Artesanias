import ListaProductos from "@/app/components/ListaProductos";
import {withAuth} from "@/app/context/AuthContext";
import ButtonBar from "@/app/components/home/ButtonBar";

function HomeAdmin({name}: {name:string}) {
    return (
        <div className="py-8">
            <h1 className="text-3xl text-gray-800 font-bold mb-6">Bienvenido, {name}!</h1>
            <ButtonBar />
            <ListaProductos isAdmin={true} />
        </div>
    );
}
export default withAuth(HomeAdmin, ['Administrador']);