'use client'
import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
    TooltipItem
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {CONST} from "@/app/constants";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface SalesData {
    namePOS: string;
    totalSold: number;
}

type ChartDataType = ChartData<'pie', number[], string>;

const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                font: {
                    size: 12
                },
                padding: 20
            }
        },
        title: {
            display: true,
            text: 'Distribución de Ventas por Punto de Venta',
            font: {
                size: 16,
                weight: 'bold'
            },
            padding: {
                bottom: 30
            }
        },
        tooltip: {
            callbacks: {
                label: function(context: TooltipItem<'pie'>) {
                    const label = context.label || '';
                    const value = context.raw as number;
                    const dataset = context.dataset.data as number[];
                    const total = dataset.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} ventas (${percentage}%)`;
                }
            }
        }
    },
};

export default function POSSalesChart() {
    const [chartData, setChartData] = useState<ChartDataType>({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 159, 64, 0.7)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        }],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${CONST.url}/payment/read-total-pos-sales`);
                const result = await response.json();

                if (result.salesByPOS) {
                    const sortedData = [...result.salesByPOS].sort((a: SalesData, b: SalesData) =>
                        b.totalSold - a.totalSold
                    );

                    const labels = sortedData.map(item => item.namePOS);
                    const sales = sortedData.map(item => item.totalSold);

                    setChartData({
                        labels,
                        datasets: [
                            {
                                data: sales,
                                backgroundColor: [
                                    'rgba(75, 192, 192, 0.7)',
                                    'rgba(255, 159, 64, 0.7)',
                                ],
                                borderColor: [
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(255, 159, 64, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    });
                }
            } catch (err) {
                setError('Error al cargar los datos de ventas');
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    const totalSales = chartData.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="h-96">
                <Pie options={options} data={chartData} />
            </div>
            <div className="mt-6 text-center">
                <div className="text-lg font-semibold text-gray-800">
                    Total de ventas: {totalSales} unidades
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    {chartData.labels?.map((label, index) => (
                        <div key={label} className="mb-1">
                            {label}: {chartData.datasets[0]?.data[index]} ventas
                            ({((chartData.datasets[0]?.data[index] || 0) / totalSales * 100).toFixed(1)}%)
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}