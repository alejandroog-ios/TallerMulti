"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, DollarSign, BarChart3, PieChart } from "lucide-react"
import { salesStorage } from "@/lib/storage"
import type { DailySale } from "@/lib/types"

export default function SalesReports() {
  const [sales, setSales] = useState<DailySale[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSales()
  }, [])

  useEffect(() => {
    generateReport()
  }, [sales, selectedPeriod])

  const loadSales = async () => {
    try {
      setLoading(true)
      setError(null)
      const allSales = await salesStorage.getAll()
      // Validar que allSales sea un array
      if (Array.isArray(allSales)) {
        setSales(allSales)
      } else {
        console.error("[v0] Sales data is not an array:", allSales)
        setSales([])
      }
    } catch (err) {
      console.error("[v0] Error loading sales:", err)
      setError("Error al cargar las ventas")
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  const generateReport = () => {
    if (!Array.isArray(sales) || sales.length === 0) {
      setReportData(null)
      return
    }

    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    const periodSales = sales.filter((sale) => new Date(sale.date) >= startDate)

    // Calcular métricas generales
    const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalSales = periodSales.length
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

    // Agrupar por tipo
    const byType = {
      reparacion: periodSales.filter((sale) => sale.type === "reparacion"),
      venta_accesorio: periodSales.filter((sale) => sale.type === "venta_accesorio"),
      venta_dispositivo: periodSales.filter((sale) => sale.type === "venta_dispositivo"),
    }

    // Agrupar por método de pago
    const byPayment = {
      efectivo: periodSales.filter((sale) => sale.paymentMethod === "efectivo"),
      tarjeta: periodSales.filter((sale) => sale.paymentMethod === "tarjeta"),
      transferencia: periodSales.filter((sale) => sale.paymentMethod === "transferencia"),
    }

    // Ventas por día (últimos 7 días para gráfico)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const daySales = periodSales.filter((sale) => new Date(sale.date).toISOString().split("T")[0] === dateStr)
      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.amount, 0)

      dailyData.push({
        date: dateStr,
        day: date.toLocaleDateString("es-ES", { weekday: "short" }),
        sales: daySales.length,
        revenue: dayRevenue,
      })
    }

    setReportData({
      period: selectedPeriod,
      totalRevenue,
      totalSales,
      averageSale,
      byType,
      byPayment,
      dailyData,
      growth: calculateGrowth(periodSales, startDate),
    })
  }

  const calculateGrowth = (currentPeriodSales: DailySale[], currentStartDate: Date) => {
    const periodLength = Date.now() - currentStartDate.getTime()
    const previousStartDate = new Date(currentStartDate.getTime() - periodLength)
    const previousEndDate = currentStartDate

    const previousPeriodSales = sales.filter(
      (sale) => new Date(sale.date) >= previousStartDate && new Date(sale.date) < previousEndDate,
    )

    const currentRevenue = currentPeriodSales.reduce((sum, sale) => sum + sale.amount, 0)
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.amount, 0)

    if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0

    return Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "week":
        return "Última Semana"
      case "month":
        return "Último Mes"
      case "year":
        return "Último Año"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reparacion":
        return "Reparaciones"
      case "venta_accesorio":
        return "Accesorios"
      case "venta_dispositivo":
        return "Dispositivos"
      default:
        return type
    }
  }

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "efectivo":
        return "Efectivo"
      case "tarjeta":
        return "Tarjeta"
      case "transferencia":
        return "Transferencia"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando reportes...</h3>
          <p className="text-gray-600">Obteniendo datos de ventas</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar reportes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSales} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos para reportes</h3>
          <p className="text-gray-600">Registra algunas ventas para ver los reportes y análisis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de período */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reportes de Ventas</h2>
          <p className="text-gray-600">Análisis y métricas de rendimiento</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            Semana
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            Mes
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("year")}
          >
            Año
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">${reportData.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <span className={`text-sm font-medium ${reportData.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {reportData.growth >= 0 ? "+" : ""}
                {reportData.growth}%
              </span>
              <span className="text-sm text-gray-600 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold">{reportData.totalSales}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio por Venta</p>
                <p className="text-2xl font-bold">${Math.round(reportData.averageSale).toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Ticket promedio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ventas por Día</p>
                <p className="text-2xl font-bold">
                  {selectedPeriod === "week"
                    ? Math.round(reportData.totalSales / 7)
                    : Math.round(reportData.totalSales / 30)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Promedio diario</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ventas diarias */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas de los Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.dailyData.map((day: any, index: number) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-blue-500 rounded"
                        style={{
                          width: `${Math.max(10, (day.revenue / Math.max(...reportData.dailyData.map((d: any) => d.revenue))) * 200)}px`,
                        }}
                      />
                      <span className="text-sm text-gray-600">{day.sales} ventas</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${day.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{new Date(day.date).getDate()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis por tipo y método de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Ventas por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.byType).map(([type, sales]: [string, any]) => {
                const revenue = sales.reduce((sum: number, sale: any) => sum + sale.amount, 0)
                const percentage = reportData.totalRevenue > 0 ? (revenue / reportData.totalRevenue) * 100 : 0

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          type === "reparacion"
                            ? "bg-blue-500"
                            : type === "venta_accesorio"
                              ? "bg-green-500"
                              : "bg-purple-500"
                        }`}
                      />
                      <span className="font-medium">{getTypeLabel(type)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {Math.round(percentage)}% • {sales.length} ventas
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.byPayment).map(([method, sales]: [string, any]) => {
                const revenue = sales.reduce((sum: number, sale: any) => sum + sale.amount, 0)
                const percentage = reportData.totalRevenue > 0 ? (revenue / reportData.totalRevenue) * 100 : 0

                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          method === "efectivo"
                            ? "bg-green-500"
                            : method === "tarjeta"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                        }`}
                      />
                      <span className="font-medium">{getPaymentLabel(method)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {Math.round(percentage)}% • {sales.length} ventas
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
