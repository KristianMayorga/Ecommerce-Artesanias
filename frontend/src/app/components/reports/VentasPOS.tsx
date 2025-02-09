'use client'
import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {CONST} from "@/app/constants";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface POSData {
    _id: string;
    name: string;
    city: string;
}

interface SalesData {
    namePOS: string;
    totalSold: number;
}

type ChartDataType = ChartData<'doughnut', number[], string>;

const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
            position: 'bottom' as const,
        },
        title: {
            display: true,
            text: 'Ventas por Punto de Venta',
            font: {
                size: 16,
                weight: 'bold'
            }
        }
    },
    maintainAspectRatio: false,
    cutout: '70%'
};

export default function POSSalesViewer() {
    const [posList, setPOSList] = useState<POSData[]>([]);
    const [selectedPOS, setSelectedPOS] = useState<string>('');
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [isLoadingPOS, setIsLoadingPOS] = useState(true);
    const [isLoadingSales, setIsLoadingSales] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPOSList = async () => {
            try {
                const response = await fetch(`${CONST.url}/pos/read-pos`);
                const data = await response.json();
                if (data.posList) {
                    setPOSList(data.posList);
                }
            } catch (err) {
                setError('Error al cargar la lista de puntos de venta');
                console.error('Error:', err);
            } finally {
                setIsLoadingPOS(false);
            }
        };

        fetchPOSList();
    }, []);

    useEffect(() => {
        const fetchSalesData = async () => {
            if (!selectedPOS) {
                setSalesData(null);
                return;
            }

            setIsLoadingSales(true);
            setError(null);

            try {
                const response = await fetch(`${CONST.url}/payment/read-total-pos-sales/${selectedPOS}`);
                const result = await response.json();

                if (result.salesByPOS) {
                    setSalesData(result.salesByPOS);
                }
            } catch (err) {
                setError('Error al cargar los datos de ventas');
                console.error('Error:', err);
            } finally {
                setIsLoadingSales(false);
            }
        };

        fetchSalesData();
    }, [selectedPOS]);

    const chartData: ChartDataType = {
        labels: [salesData?.namePOS || 'Total de Ventas'],
        datasets: [
            {
                data: [salesData?.totalSold || 0],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            }
        ]
    };

    if (isLoadingPOS) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <label htmlFor="pos-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona un Punto de Venta
                </label>
                <select
                    id="pos-select"
                    className="w-full p-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedPOS}
                    onChange={(e) => setSelectedPOS(e.target.value)}
                >
                    <option value="">Seleccionar POS...</option>
                    {posList.map((pos) => (
                        <option key={pos._id} value={pos._id}>
                            {pos.name} - {pos.city}
                        </option>
                    ))}
                </select>
            </div>

            {isLoadingSales ? (
                <div className="h-64 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : selectedPOS && salesData ? (
                <div className="space-y-6">
                    <div className="h-64">
                        <Doughnut options={options} data={chartData} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Detalles de Ventas
                        </h3>
                        <div className="space-y-2">
                            <p className="text-gray-600">
                                <span className="font-medium">Punto de Venta:</span> {salesData.namePOS}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Total de Ventas:</span> {salesData.totalSold} unidades
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-600 py-12">
                    Selecciona un punto de venta para ver sus ventas totales
                </div>
            )}
        </div>
    );
}