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
    ChartOptions,
    Scale,
    CoreScaleOptions,
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

interface ProductData {
    productName: string;
    totalSold: number;
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
            text: 'Productos Más Vendidos',
            font: {
                size: 16,
                weight: 'bold'
            }
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Unidades Vendidas',
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
            ticks: {
                callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number) {
                    const label = this.getLabelForValue(Number(tickValue));
                    if (typeof label === 'string' && label.length > 20) {
                        return label.substr(0, 20) + '...';
                    }
                    return label;
                }
            }
        }
    },
    maintainAspectRatio: false
};

export default function TopSellingProducts() {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await fetch(`${CONST.url}/payment/top-selling-products`);
                const result = await response.json();

                if (!result.error && result.data) {
                    setProducts(result.data);
                }
            } catch (err) {
                setError('Error al cargar los productos más vendidos');
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopProducts();
    }, []);

    const chartData: ChartDataType = {
        labels: products.map(product => product.productName),
        datasets: [
            {
                data: products.map(product => product.totalSold),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="h-96">
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
}