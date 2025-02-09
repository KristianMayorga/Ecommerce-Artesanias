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

interface StockData {
    categoryName: string;
    totalStock: number;
}

const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Stock Disponible por Categoría',
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
            },
            ticks: {
                stepSize: 20
            }
        },
        x: {
            title: {
                display: true,
                text: 'Categorías',
                font: {
                    size: 12,
                    weight: 'bold'
                }
            }
        }
    }
};

export default function StockCategoriesChart() {
    type ChartDataType = ChartData<'bar', number[], string>;

    const [chartData, setChartData] = useState<ChartDataType>({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
        }]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${CONST.url}/stock/read-stock_by_category`);
                const result = await response.json();

                if (result.stockByCategory) {
                    const sortedData = [...result.stockByCategory].sort((a: StockData, b: StockData) =>
                        b.totalStock - a.totalStock
                    );

                    const labels = sortedData.map(item => item.categoryName);
                    const stocks = sortedData.map(item => item.totalStock);

                    setChartData({
                        labels,
                        datasets: [
                            {
                                data: stocks,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.5)',
                                    'rgba(54, 162, 235, 0.5)',
                                    'rgba(255, 206, 86, 0.5)',
                                    'rgba(75, 192, 192, 0.5)',
                                    'rgba(153, 102, 255, 0.5)',
                                    'rgba(255, 159, 64, 0.5)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    });
                }
            } catch (err) {
                setError('Error al cargar los datos de stock');
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            <Bar options={options} data={chartData} />
            <div className="mt-4 text-sm text-gray-600 text-center">
                Stock total: {chartData.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0)} unidades
            </div>
        </div>
    );
}