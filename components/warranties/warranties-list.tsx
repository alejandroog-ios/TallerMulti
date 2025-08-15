"use client"

import { useState, useEffect } from "react"
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { warrantiesStorage } from "@/lib/storage"
import type { Warranty } from "@/lib/types"

interface WarrantiesListProps {
  onView: (warranty: Warranty) => void
  onProcessClaim: (warranty: Warranty) => void
}

export default function WarrantiesList({ onView, onProcessClaim }: WarrantiesListProps) {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [filteredWarranties, setFilteredWarranties] = useState<Warranty[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWarranties()
  }, [])

  useEffect(() => {
    filterWarranties()
  }, [warranties, searchTerm, selectedStatus])

  const loadWarranties = async () => {
    try {
      setLoading(true)
      setError(null)
      const allWarranties = await warrantiesStorage.getAll()

      if (Array.isArray(allWarranties)) {
        allWarranties.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        setWarranties(allWarranties)
      } else {
        console.error("[v0] Expected array but got:", typeof allWarranties, allWarranties)
        setWarranties([])
        setError("Error al cargar las garantías: formato de datos incorrecto")
      }
    } catch (err) {
      console.error("[v0] Error loading warranties:", err)
      setError("Error al cargar las garantías")
      setWarranties([])
    } finally {
      setLoading(false)
    }
  }

  const filterWarranties = () => {
    let filtered = warranties

    if (searchTerm) {
      filtered = filtered.filter(
        (warranty) =>
          warranty.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          warranty.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedStatus !== "all") {
      const now = new Date()
      filtered = filtered.filter((warranty) => {
        switch (selectedStatus) {
          case "active":
            return warranty.status === "active" && new Date(warranty.endDate) > now
          case "expired":
            return warranty.status === "active" && new Date(warranty.endDate) <= now
          case "claimed":
            return warranty.status === "claimed"
          case "expiring":
            const daysUntilExpiry = Math.ceil(
              (new Date(warranty.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            )
            return warranty.status === "active" && daysUntilExpiry <= 7 && daysUntilExpiry > 0
          default:
            return true
        }
      })
    }

    setFilteredWarranties(filtered)
  }

  const getWarrantyStatus = (warranty: Warranty) => {
    const now = new Date()
    const endDate = new Date(warranty.endDate)
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (warranty.status === "claimed") {
      return { status: "claimed", label: "Reclamada", color: "bg-red-100 text-red-800", icon: XCircle }
    }

    if (warranty.status !== "active") {
      return { status: "inactive", label: "Inactiva", color: "bg-gray-100 text-gray-800", icon: XCircle }
    }

    if (endDate <= now) {
      return { status: "expired", label: "Vencida", color: "bg-gray-100 text-gray-800", icon: XCircle }
    }

    if (daysUntilExpiry <= 7) {
      return { status: "expiring", label: "Por vencer", color: "bg-orange-100 text-orange-800", icon: AlertTriangle }
    }

    return { status: "active", label: "Activa", color: "bg-green-100 text-green-800", icon: CheckCircle }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDaysRemaining = (endDate: Date | string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getWarrantyCounts = () => {
    const now = new Date()
    return {
      all: warranties.length,
      active: warranties.filter((w) => w.status === "active" && new Date(w.endDate) > now).length,
      expired: warranties.filter((w) => w.status === "active" && new Date(w.endDate) <= now).length,
      claimed: warranties.filter((w) => w.status === "claimed").length,
      expiring: warranties.filter((w) => {
        const daysUntilExpiry = Math.ceil((new Date(w.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return w.status === "active" && daysUntilExpiry <= 7 && daysUntilExpiry > 0
      }).length,
    }
  }

  const counts = getWarrantyCounts()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mb-4 mx-auto animate-pulse" />
            <p className="text-gray-600">Cargando garantías...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar garantías</h3>
            <p className="text-red-700 text-center mb-4">{error}</p>
            <Button onClick={loadWarranties} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestión de Garantías</h2>
          <p className="text-sm sm:text-base text-gray-600">
            {filteredWarranties.length} garantías • {counts.active} activas • {counts.expiring} por vencer
          </p>
        </div>
      </div>

      {counts.expiring > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Garantías por Vencer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs sm:text-sm text-orange-700">
              Tienes {counts.expiring} garantía{counts.expiring > 1 ? "s" : ""} que vence
              {counts.expiring > 1 ? "n" : ""} en los próximos 7 días.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedStatus("all")}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold">{counts.all}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-green-50" onClick={() => setSelectedStatus("active")}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{counts.active}</div>
            <div className="text-xs sm:text-sm text-gray-600">Activas</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-orange-50 col-span-2 sm:col-span-1"
          onClick={() => setSelectedStatus("expiring")}
        >
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{counts.expiring}</div>
            <div className="text-xs sm:text-sm text-gray-600">Por Vencer</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedStatus("expired")}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-600">{counts.expired}</div>
            <div className="text-xs sm:text-sm text-gray-600">Vencidas</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-red-50" onClick={() => setSelectedStatus("claimed")}>
          <CardContent className="p-2 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{counts.claimed}</div>
            <div className="text-xs sm:text-sm text-gray-600">Reclamadas</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar garantías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="expiring">Por vencer</option>
          <option value="expired">Vencidas</option>
          <option value="claimed">Reclamadas</option>
        </select>
      </div>

      {/* Lista de garantías */}
      {filteredWarranties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Shield className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay garantías</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4">
              {searchTerm || selectedStatus !== "all"
                ? "No se encontraron garantías"
                : "Las garantías se crean automáticamente"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredWarranties.map((warranty) => {
            const status = getWarrantyStatus(warranty)
            const StatusIcon = status.icon
            const daysRemaining = getDaysRemaining(warranty.endDate)

            return (
              <Card key={warranty.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg font-semibold truncate">{warranty.customerName}</h3>
                        <Badge className={`${status.color} text-xs w-fit`}>
                          <span className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {status.label}
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                          <div className="truncate">
                            <span className="font-medium">Dispositivo:</span> {warranty.deviceInfo}
                          </div>
                          <div>
                            <span className="font-medium">Duración:</span> {warranty.warrantyMonths} meses
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">{daysRemaining > 0 ? "Días restantes:" : "Vencida hace:"}</span>{" "}
                          <span
                            className={
                              daysRemaining > 7
                                ? "text-green-600"
                                : daysRemaining > 0
                                  ? "text-orange-600"
                                  : "text-red-600"
                            }
                          >
                            {Math.abs(daysRemaining)} días
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(warranty.startDate)}</span>
                        <span>•</span>
                        <span>Vence: {formatDate(warranty.endDate)}</span>
                        {warranty.claimDate && (
                          <>
                            <span>•</span>
                            <span className="text-red-600">Reclamada: {formatDate(warranty.claimDate)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(warranty)}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Ver
                      </Button>
                      {warranty.status === "active" &&
                        new Date(warranty.endDate) > new Date() &&
                        !warranty.claimDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onProcessClaim(warranty)}
                            className="flex-1 text-xs sm:text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Reclamar
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
