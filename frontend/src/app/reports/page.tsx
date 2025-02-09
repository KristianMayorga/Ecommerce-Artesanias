'use client'

import { withAuth } from "@/app/context/AuthContext";
import { ROLES } from "@/app/types";
import TransactionsChart from "@/app/components/reports/TransaccionesUsers";
import StockCategoriesChart from "@/app/components/reports/CantidadCategoria";
import POSSalesChart from "@/app/components/reports/VentasPOSSelector";
import POSSalesViewer from "@/app/components/reports/VentasPOS";
import TopSellingProducts from "@/app/components/reports/TopVentas";
import StockByPOS from "@/app/components/reports/StockByPOS";

function Reports() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Reportes y Estadísticas
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                    <TopSellingProducts />
                </div>

                <div className="w-full">
                    <StockCategoriesChart />
                </div>

                <div className="w-full">
                    <TransactionsChart />
                </div>

                <div className="w-full">
                    <POSSalesChart />
                </div>

                <div className="w-full">
                    <POSSalesViewer />
                </div>
                <div className="w-full">
                    <StockByPOS />
                </div>
            </div>
        </div>
    );
}

export default withAuth(Reports, [ROLES.ADMIN]);