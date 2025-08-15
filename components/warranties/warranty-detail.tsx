"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Shield,
  Smartphone,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"
import { jobsStorage } from "@/lib/storage"
import type { Warranty, Job } from "@/lib/types"
import { useEffect, useState } from "react"

interface WarrantyDetailProps {
  warranty: Warranty
  onBack: () => void
  onProcessClaim: () => void
}

export default function WarrantyDetail({ warranty, onBack, onProcessClaim }: WarrantyDetailProps) {
  const [relatedJob, setRelatedJob] = useState<Job | null>(null)

  useEffect(() => {
    // Buscar el trabajo relacionado
    const jobs = jobsStorage.getAll()
    const job = jobs.find((j) => j.id === warranty.jobId)
    setRelatedJob(job || null)
  }, [warranty.jobId])

  const getWarrantyStatus = () => {
    const now = new Date()
    const endDate = new Date(warranty.endDate)
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (warranty.claimDate) {
      return { status: "claimed", label: "Reclamada", color: "bg-red-100 text-red-800", icon: XCircle }
    }

    if (!warranty.isActive) {
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysRemaining = () => {
    const now = new Date()
    const end = new Date(warranty.endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const status = getWarrantyStatus()
  const StatusIcon = status.icon
  const daysRemaining = getDaysRemaining()

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
            <h1 className="text-2xl font-bold">Garantía #{warranty.id}</h1>
            <p className="text-gray-600">Cliente: {warranty.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={status.color}>
            <span className="flex items-center gap-1">
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
          </Badge>
          {warranty.isActive && new Date(warranty.endDate) > new Date() && !warranty.claimDate && (
            <Button onClick={onProcessClaim} className="bg-orange-600 hover:bg-orange-700">
              <FileText className="w-4 h-4 mr-2" />
              Procesar Reclamación
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del cliente y dispositivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre del Cliente</label>
                <p className="text-lg">{warranty.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dispositivo</label>
                <p className="text-lg">{warranty.deviceInfo}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Trabajo Realizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-600">Descripción del Trabajo</label>
                <p className="mt-1">{warranty.workDone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Información del trabajo relacionado */}
          {relatedJob && (
            <Card>
              <CardHeader>
                <CardTitle>Trabajo Relacionado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Problema Original</label>
                    <p className="text-sm">{relatedJob.problem}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Costo Final</label>
                    <p className="text-sm">${relatedJob.finalCost || relatedJob.estimatedCost}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                    <p className="text-sm">{formatDate(relatedJob.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <p className="text-sm capitalize">{relatedJob.status.replace("_", " ")}</p>
                  </div>
                </div>
                {relatedJob.partsUsed && relatedJob.partsUsed.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Partes Utilizadas</label>
                    <div className="mt-2 space-y-1">
                      {relatedJob.partsUsed.map((part, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>
                            {part.itemName} (x{part.quantity})
                          </span>
                          <span>${(part.price * part.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reclamación (si existe) */}
          {warranty.claimDate && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Reclamación Procesada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-red-700">Fecha de Reclamación</label>
                  <p className="text-red-800">{formatDate(warranty.claimDate)}</p>
                </div>
                {warranty.claimReason && (
                  <div>
                    <label className="text-sm font-medium text-red-700">Motivo de la Reclamación</label>
                    <p className="text-red-800">{warranty.claimReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar con información de la garantía */}
        <div className="space-y-6">
          {/* Estado y tiempo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Estado de la Garantía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <StatusIcon
                  className={`w-12 h-12 mx-auto mb-2 ${status.status === "active" ? "text-green-600" : status.status === "expiring" ? "text-orange-600" : "text-red-600"}`}
                />
                <p className="text-lg font-semibold">{status.label}</p>
                {daysRemaining > 0 ? (
                  <p className="text-sm text-gray-600">
                    {daysRemaining} día{daysRemaining > 1 ? "s" : ""} restante{daysRemaining > 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Vencida hace {Math.abs(daysRemaining)} día{Math.abs(daysRemaining) > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fechas importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                <p>{formatDate(warranty.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Vencimiento</label>
                <p
                  className={
                    daysRemaining <= 7 && daysRemaining > 0
                      ? "text-orange-600 font-medium"
                      : daysRemaining <= 0
                        ? "text-red-600 font-medium"
                        : ""
                  }
                >
                  {formatDate(warranty.endDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Duración</label>
                <p>{warranty.warrantyDays} días</p>
              </div>
            </CardContent>
          </Card>

          {/* Progreso visual */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso de la Garantía</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>
                    {Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          ((warranty.warrantyDays - Math.max(0, daysRemaining)) / warranty.warrantyDays) * 100,
                        ),
                      ),
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      warranty.claimDate
                        ? "bg-red-500"
                        : daysRemaining <= 0
                          ? "bg-gray-500"
                          : daysRemaining <= 7
                            ? "bg-orange-500"
                            : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, Math.round(((warranty.warrantyDays - Math.max(0, daysRemaining)) / warranty.warrantyDays) * 100)))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Inicio</span>
                  <span>Vencimiento</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
