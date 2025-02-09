import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

const AvailabilityCard = ({ isAvailable} : {isAvailable:boolean}) => {
    if (!isAvailable) {
        return (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                            ¡Traslado en proceso!
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>Algunos productos se encuentran en otras tiendas. Iniciaremos el traslado a la tienda
                                seleccionada y estarán disponibles para recoger en 3 días hábiles</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                        Disponibilidad inmediata
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                        <p>Todos los productos están listos para recoger a partir de hoy</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityCard;