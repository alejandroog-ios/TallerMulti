"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, DollarSign, CreditCard, Smartphone, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { salesStorage } from "@/lib/storage"
import type { DailySale, DailySummary } from "@/lib/types"

interface SalesListProps {
  onAddNew: () => void
}

export default function SalesList({ onAddNew }: SalesListProps) {
  const [sales, setSales] = useState<DailySale[]>([])
  const [filteredSales, setFilteredSales] = useState<DailySale[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedType, setSelectedType] = useState<string>("all")
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSales()
  }, [])

  useEffect(() => {
    filterSales()
    calculateDailySummary()
  }, [sales, selectedDate, selectedType])

  const loadSales = async () => {
    try {
      setLoading(true)
      setError(null)
      const allSales = await salesStorage.getAll()

      // Verificar que allSales es un array
      if (Array.isArray(allSales)) {
        // Ordenar por fecha, más recientes primero
        allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

  const filterSales = () => {
    let filtered = sales

    // Filtrar por fecha
    filtered = filtered.filter((sale) => {
      const saleDate = new Date(sale.date).toISOString().split("T")[0]
      return saleDate === selectedDate
    })

    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter((sale) => sale.type === selectedType)
    }

    setFilteredSales(filtered)
  }

  const calculateDailySummary = () => {
    const daysSales = sales.filter((sale) => {
      const saleDate = new Date(sale.date).toISOString().split("T")[0]
      return saleDate === selectedDate
    })

    if (daysSales.length === 0) {
      setDailySummary(null)
      return
    }

    const summary: DailySummary = {
      date: selectedDate,
      totalSales: daysSales.length,
      totalJobs: daysSales.filter((sale) => sale.type === "reparacion").length,
      totalRevenue: daysSales.reduce((sum, sale) => sum + sale.amount, 0),
      paymentBreakdown: {
        efectivo: daysSales
          .filter((sale) => sale.paymentMethod === "efectivo")
          .reduce((sum, sale) => sum + sale.amount, 0),
        tarjeta: daysSales
          .filter((sale) => sale.paymentMethod === "tarjeta")
          .reduce((sum, sale) => sum + sale.amount, 0),
        transferencia: daysSales
          .filter((sale) => sale.paymentMethod === "transferencia")
          .reduce((sum, sale) => sum + sale.amount, 0),
      },
    }

    setDailySummary(summary)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reparacion":
        return "bg-blue-100 text-blue-800"
      case "venta_accesorio":
        return "bg-green-100 text-green-800"
      case "venta_dispositivo":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reparacion":
        return "Reparación"
      case "venta_accesorio":
        return "Venta Accesorio"
      case "venta_dispositivo":
        return "Venta Dispositivo"
      default:
        return type
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "efectivo":
        return <DollarSign className="w-4 h-4" />
      case "tarjeta":
        return <CreditCard className="w-4 h-4" />
      case "transferencia":
        return <Smartphone className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
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

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando ventas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadSales} variant="outline">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestión de Ventas</h2>
          <p className="text-sm sm:text-base text-gray-600">Registro y seguimiento diario</p>
        </div>
        <Button onClick={onAddNew} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {dailySummary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Ventas</p>
                  <p className="text-lg sm:text-2xl font-bold">{dailySummary.totalSales}</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Reparaciones</p>
                  <p className="text-lg sm:text-2xl font-bold">{dailySummary.totalJobs}</p>
                </div>
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Ingresos</p>
                  <p className="text-sm sm:text-2xl font-bold text-green-600">
                    ${dailySummary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Promedio</p>
                  <p className="text-sm sm:text-2xl font-bold">
                    ${Math.round(dailySummary.totalRevenue / dailySummary.totalSales).toLocaleString()}
                  </p>
                </div>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {dailySummary && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Desglose por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Efectivo</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {Math.round((dailySummary.paymentBreakdown.efectivo / dailySummary.totalRevenue) * 100)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-lg font-bold text-green-600">
                  ${dailySummary.paymentBreakdown.efectivo.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Tarjeta</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {Math.round((dailySummary.paymentBreakdown.tarjeta / dailySummary.totalRevenue) * 100)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-lg font-bold text-blue-600">
                  ${dailySummary.paymentBreakdown.tarjeta.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Transferencia</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {Math.round((dailySummary.paymentBreakdown.transferencia / dailySummary.totalRevenue) * 100)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-lg font-bold text-purple-600">
                  ${dailySummary.paymentBreakdown.transferencia.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm sm:text-base"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="all">Todos</option>
          <option value="reparacion">Reparaciones</option>
          <option value="venta_accesorio">Accesorios</option>
          <option value="venta_dispositivo">Dispositivos</option>
        </select>
      </div>

      <div className="text-center py-2">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">{formatDate(selectedDate)}</h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {filteredSales.length} venta{filteredSales.length !== 1 ? "s" : ""} registrada
          {filteredSales.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filteredSales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <DollarSign className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay ventas registradas</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4">
              No se encontraron ventas para esta fecha
            </p>
            <Button onClick={onAddNew} variant="outline" className="text-sm sm:text-base bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primera Venta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredSales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <Badge className={`${getTypeColor(sale.type)} text-xs w-fit`}>{getTypeLabel(sale.type)}</Badge>
                      <span className="text-xs sm:text-sm text-gray-500">{formatTime(sale.date)}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 truncate">{sale.description}</h3>
                    {sale.clientName && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Cliente: {sale.clientName}</p>
                    )}
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="text-lg sm:text-xl font-bold text-green-600">${sale.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1 justify-end">
                      {getPaymentIcon(sale.paymentMethod)}
                      <span>{getPaymentLabel(sale.paymentMethod)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
