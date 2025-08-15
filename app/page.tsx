"use client"

import { useState, useEffect } from "react"
import SplashScreen from "@/components/splash-screen"
import Navigation from "@/components/navigation"
import InventoryManager from "@/components/inventory/inventory-manager"
import JobsManager from "@/components/jobs/jobs-manager"
import WarrantiesManager from "@/components/warranties/warranties-manager"
import SalesManager from "@/components/sales/sales-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Wrench, Shield, TrendingUp, AlertTriangle } from "lucide-react"
import { inventoryStorage, jobsStorage, warrantiesStorage, salesStorage } from "@/lib/storage"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState("dashboard")
  const [stats, setStats] = useState({
    totalInventory: 0,
    lowStockItems: 0,
    pendingJobs: 0,
    activeWarranties: 0,
    todayRevenue: 0,
  })

  useEffect(() => {
    if (!isLoading) {
      updateStats()
    }
  }, [isLoading])

  const updateStats = async () => {
    try {
      const [inventory, jobs, warranties, todaySales] = await Promise.all([
        inventoryStorage.getAll(),
        jobsStorage.getAll(),
        warrantiesStorage.getAll(),
        salesStorage.getByDate(new Date().toISOString()),
      ])

      setStats({
        totalInventory: inventory.length,
        lowStockItems: inventory.filter((item) => item.quantity <= item.minStock).length,
        pendingJobs: jobs.filter((job) => job.status === "pendiente" || job.status === "en_proceso").length,
        activeWarranties: warranties.filter((warranty) => warranty.isActive && new Date(warranty.endDate) > new Date())
          .length,
        todayRevenue: todaySales.reduce((sum, sale) => sum + sale.amount, 0),
      })
    } catch (error) {
      console.error("[v0] Error updating stats:", error)
      setStats({
        totalInventory: 0,
        lowStockItems: 0,
        pendingJobs: 0,
        activeWarranties: 0,
        todayRevenue: 0,
      })
    }
  }

  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />
  }

  const renderDashboard = () => (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Resumen general del taller</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Inventario Total</CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats.totalInventory}</div>
            <p className="text-xs text-muted-foreground">productos en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">productos por reponer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Trabajos Pendientes</CardTitle>
            <Wrench className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground">en proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Garantías Activas</CardTitle>
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats.activeWarranties}</div>
            <p className="text-xs text-muted-foreground">vigentes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            Ventas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-green-600">${stats.todayRevenue.toLocaleString()}</div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Ingresos del día actual</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            <button
              onClick={() => setCurrentView("jobs")}
              className="w-full p-4 md:p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
            >
              <div className="font-medium text-sm md:text-base">Nuevo Trabajo</div>
              <div className="text-xs md:text-sm text-gray-600">Registrar nueva reparación</div>
            </button>
            <button
              onClick={() => setCurrentView("inventory")}
              className="w-full p-4 md:p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors touch-manipulation"
            >
              <div className="font-medium text-sm md:text-base">Agregar Inventario</div>
              <div className="text-xs md:text-sm text-gray-600">Añadir nuevos productos</div>
            </button>
            <button
              onClick={() => setCurrentView("sales")}
              className="w-full p-4 md:p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors touch-manipulation"
            >
              <div className="font-medium text-sm md:text-base">Registrar Venta</div>
              <div className="text-xs md:text-sm text-gray-600">Nueva venta directa</div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm">Base de Datos</span>
              <span className="text-xs md:text-sm text-green-600 font-medium">Supabase</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm">Modo Offline</span>
              <span className="text-xs md:text-sm text-green-600 font-medium">Habilitado</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm">Última Actualización</span>
              <span className="text-xs md:text-sm text-gray-600">{new Date().toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard()
      case "inventory":
        return (
          <div className="p-3 md:p-6">
            <InventoryManager />
          </div>
        )
      case "jobs":
        return (
          <div className="p-3 md:p-6">
            <JobsManager />
          </div>
        )
      case "warranties":
        return (
          <div className="p-3 md:p-6">
            <WarrantiesManager />
          </div>
        )
      case "sales":
        return (
          <div className="p-3 md:p-6">
            <SalesManager />
          </div>
        )
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 lg:ml-0">{renderCurrentView()}</main>
    </div>
  )
}
