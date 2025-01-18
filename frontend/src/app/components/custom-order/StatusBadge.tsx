import {OrderStatus} from "@/app/components/custom-order/types";

const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const styles = {
        pendiente: 'bg-yellow-100 text-yellow-800',
        aceptado: 'bg-green-100 text-green-800',
        rechazado: 'bg-red-100 text-red-800'
    };
    const labels = {
        pendiente: 'Pendiente',
        aceptado: 'Aprobado',
        rechazado: 'Rechazado'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default StatusBadge;