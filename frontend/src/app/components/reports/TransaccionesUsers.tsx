'use client'
import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    ChartData,
    ChartOptions,
    TooltipItem
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { CONST } from "@/app/constants";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
);

interface TransactionData {
    userName: string;
    transactionCount: number;
}

type ChartDataType = ChartData<'bar', number[], string>;

const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Transacciones por Usuario',
            font: {
                size: 16,
                weight: 'bold'
            }
        },
        tooltip: {
            callbacks: {
                label: function(context: TooltipItem<'bar'>) {
                    return `${context.raw} transacciones`;
                }
            }
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Número de Transacciones',
                font: {
                    size: 12,
                    weight: 'bold'
                }
            },
            ticks: {
                stepSize: 1
            }
        },
        y: {
            title: {
                display: true,
                text: 'Usuarios',
                font: {
                    size: 12,
                    weight: 'bold'
                }
            }
        }
    },
    maintainAspectRatio: false
};

export default function TransactionsChart() {
    const [chartData, setChartData] = useState<ChartDataType>({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            borderRadius: 4,
        }],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${CONST.url}/payment/transaction-count`);
                const result = await response.json();

                if (!result.error && Array.isArray(result.data)) {
                    const sortedData = [...result.data].sort((a: TransactionData, b: TransactionData) =>
                        b.transactionCount - a.transactionCount
                    );

                    const labels = sortedData.map(item => item.userName);
                    const counts = sortedData.map(item => item.transactionCount);

                    setChartData({
                        labels,
                        datasets: [
                            {
                                data: counts,
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1,
                                borderRadius: 4,
                            },
                        ],
                    });
                }
            } catch (err) {
                setError('Error al cargar los datos de transacciones');
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="h-[400px]">
                <Bar options={options} data={chartData} />
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
                Total de transacciones: {chartData.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0)}
            </div>
        </div>
    );
}