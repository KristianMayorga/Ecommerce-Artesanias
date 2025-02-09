'use client'
import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {CONST} from "@/app/constants";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface StockPOSData {
    namePOS: string;
    totalAmount: number;
}

type ChartDataType = ChartData<'bar', number[], string>;

const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Stock por Punto de Venta',
            font: {
                size: 16,
                weight: 'bold'
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Cantidad en Stock',
                font: {
                    size: 12,
                    weight: 'bold'
                }
            }
        }
    },
    maintainAspectRatio: false
};

export default function StockByPOS() {
    const [stockData, setStockData] = useState<StockPOSData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await fetch(`${CONST.url}/stock/read-cout-stock-by-pos`);
                const result = await response.json();

                if (result.stockAggregation) {
                    setStockData(result.stockAggregation);
                }
            } catch (err) {
                setError('Error al cargar los datos de stock');
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStockData();
    }, []);

    const chartData: ChartDataType = {
        labels: stockData.map(item => item.namePOS),
        datasets: [
            {
                data: stockData.map(item => item.totalAmount),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="h-64">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
}