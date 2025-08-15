"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Phone, Smartphone, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react"
import type { Job } from "@/lib/types"

interface JobDetailProps {
  job: Job
  onBack: () => void
  onEdit: () => void
}

export default function JobDetail({ job, onBack, onEdit }: JobDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "en_proceso":
        return "bg-blue-100 text-blue-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "entregado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente"
      case "en_proceso":
        return "En Proceso"
      case "completado":
        return "Completado"
      case "entregado":
        return "Entregado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "en_proceso":
        return <AlertCircle className="w-4 h-4" />
      case "completado":
        return <CheckCircle className="w-4 h-4" />
      case "entregado":
        return <Truck className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysElapsed = (startDate: Date | string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const totalPartsCost =
    job.partsUsed?.reduce((sum, part) => {
      const price = typeof part.price === "number" ? part.price : 0
      const quantity = typeof part.quantity === "number" ? part.quantity : 0
      return sum + price * quantity
    }, 0) || 0

  const formatPrice = (value: number | undefined | null): string => {
    const numValue = typeof value === "number" ? value : 0
    return numValue.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trabajo #{job.id}</h1>
            <p className="text-gray-600">Cliente: {job.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(job.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(job.status)}
              {getStatusLabel(job.status)}
            </span>
          </Badge>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente y dispositivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-lg">{job.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-lg">{job.clientPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Marca</label>
                  <p className="text-lg">{job.deviceBrand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Modelo</label>
                  <p className="text-lg">{job.deviceModel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del trabajo */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Problema Reportado</label>
                <p className="mt-1">{job.problem}</p>
              </div>
              {job.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnóstico</label>
                  <p className="mt-1">{job.diagnosis}</p>
                </div>
              )}
              {job.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notas Adicionales</label>
                  <p className="mt-1">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partes utilizadas */}
          {job.partsUsed && job.partsUsed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Partes Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.partsUsed.map((part, index) => {
                    const price = typeof part.price === "number" ? part.price : 0
                    const quantity = typeof part.quantity === "number" ? part.quantity : 0
                    const total = price * quantity

                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{part.itemName || "Parte sin nombre"}</p>
                          <p className="text-sm text-gray-600">Cantidad: {quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${formatPrice(total)}</p>
                          <p className="text-sm text-gray-600">${formatPrice(price)} c/u</p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Partes:</span>
                      <span>${formatPrice(totalPartsCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar con información adicional */}
        <div className="space-y-6">
          {/* Fechas y tiempo */}
          <Card>
            <CardHeader>
              <CardTitle>Cronología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                <p>{formatDate(job.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Días Transcurridos</label>
                <p>{getDaysElapsed(job.startDate)} días</p>
              </div>
              {job.completionDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Finalización</label>
                  <p>{formatDate(job.completionDate)}</p>
                </div>
              )}
              {job.deliveryDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Entrega</label>
                  <p>{formatDate(job.deliveryDate)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Costos */}
          <Card>
            <CardHeader>
              <CardTitle>Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Costo Estimado:</span>
                <span>${formatPrice(job.estimatedCost)}</span>
              </div>
              {(job.finalCost || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Final:</span>
                  <span className="font-semibold">${formatPrice(job.finalCost)}</span>
                </div>
              )}
              {totalPartsCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Costo Partes:</span>
                  <span>${formatPrice(totalPartsCost)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Garantía */}
          <Card>
            <CardHeader>
              <CardTitle>Garantía</CardTitle>
            </CardHeader>
            <CardContent>
              {job.hasWarranty ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Incluye garantía</span>
                  </div>
                  <p className="text-sm text-gray-600">{job.warrantyDays} días de garantía</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Sin garantía</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
