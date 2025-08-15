"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { warrantiesStorage } from "@/lib/storage"
import type { Warranty } from "@/lib/types"

interface WarrantyClaimFormProps {
  warranty: Warranty
  onSave: () => void
  onCancel: () => void
}

export default function WarrantyClaimForm({ warranty, onSave, onCancel }: WarrantyClaimFormProps) {
  const [claimReason, setClaimReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!claimReason.trim()) {
      setError("El motivo de la reclamación es requerido")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Actualizar la garantía con la información de la reclamación
      warrantiesStorage.update(warranty.id, {
        claimDate: new Date(),
        claimReason: claimReason.trim(),
        isActive: false, // Desactivar la garantía al ser reclamada
      })

      onSave()
    } catch (error) {
      console.error("Error processing warranty claim:", error)
      setError("Error al procesar la reclamación. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDaysRemaining = () => {
    const now = new Date()
    const end = new Date(warranty.endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Procesar Reclamación de Garantía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Estás a punto de procesar una reclamación para esta garantía. Una vez procesada, la garantía será marcada
            como reclamada y no podrá ser revertida.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Garantía</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Cliente</label>
              <p className="text-lg">{warranty.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Dispositivo</label>
              <p className="text-lg">{warranty.deviceInfo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Trabajo Realizado</label>
              <p className="text-sm">{warranty.workDone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Duración de Garantía</label>
              <p className="text-sm">{warranty.warrantyDays} días</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
              <p className="text-sm">{formatDate(warranty.startDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de Vencimiento</label>
              <p className="text-sm">{formatDate(warranty.endDate)}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              Estado:{" "}
              {daysRemaining > 0 ? `${daysRemaining} días restantes` : `Vencida hace ${Math.abs(daysRemaining)} días`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Reclamación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de la Reclamación *</label>
              <Textarea
                value={claimReason}
                onChange={(e) => {
                  setClaimReason(e.target.value)
                  if (error) setError("")
                }}
                placeholder="Describe el motivo de la reclamación de garantía (problema reportado por el cliente, falla del trabajo realizado, etc.)"
                rows={4}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Esta información será registrada permanentemente en el historial de la garantía.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Importante</h4>
                  <p className="text-sm text-yellow-700 mt-1">Al procesar esta reclamación:</p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                    <li>La garantía será marcada como "Reclamada"</li>
                    <li>Se registrará la fecha y motivo de la reclamación</li>
                    <li>La garantía será desactivada automáticamente</li>
                    <li>Esta acción no puede ser revertida</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? "Procesando..." : "Procesar Reclamación"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
