import ListaProductos from "@/app/components/ListaProductos";

export default function HomePOS({name}: {name:string}) {
    return (
        <div className="py-8">
            <h1 className="text-3xl text-gray-800 font-bold mb-6">Bienvenido Vendedor, {name}!</h1>
            <ListaProductos />
        </div>
    );
}