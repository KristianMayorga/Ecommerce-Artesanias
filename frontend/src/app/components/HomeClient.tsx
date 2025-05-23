import ListaProductos from "@/app/components/ListaProductos";
import ShoppingCart from "@/app/components/ShoppingCart";

export default function HomeClient({name}: {name:string}) {
    return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-gray-800 font-bold mb-6">Bienvenido, {name}!</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ListaProductos />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <ShoppingCart />
                        </div>
                    </div>
                </div>
            </div>
    );
}