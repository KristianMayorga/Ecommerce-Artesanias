import {CheckCircle, Clock, XCircle} from "lucide-react";
import {OrderStatus} from "@/app/components/custom-order/types";

const AdminControls = ({
                           orderId,
                           onStatusUpdate
                       }: {
    orderId: number,
    onStatusUpdate: (orderId: number, status: OrderStatus) => void
}) => (
    <div className="flex gap-2">
        <button
            onClick={() => onStatusUpdate(orderId, 'pendiente')}
            className="p-2 bg-yellow-100 rounded-full hover:bg-yellow-200"
            title="Marcar como pendiente"
        >
            <Clock className="w-5 h-5 text-yellow-600" />
        </button>
        <button
            onClick={() => onStatusUpdate(orderId, 'aceptado')}
            className="p-2 bg-green-100 rounded-full hover:bg-green-200"
            title="Aprobar pedido"
        >
            <CheckCircle className="w-5 h-5 text-green-600" />
        </button>
        <button
            onClick={() => onStatusUpdate(orderId, 'rechazado')}
            className="p-2 bg-red-100 rounded-full hover:bg-red-200"
            title="Rechazar pedido"
        >
            <XCircle className="w-5 h-5 text-red-600" />
        </button>
    </div>
);

export default AdminControls;