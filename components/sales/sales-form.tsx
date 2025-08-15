"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { salesStorage, jobsStorage } from "@/lib/storage"
import type { Job } from "@/lib/types"

interface SalesFormProps {
  onSave: () => void
  onCancel: () => void
}

export default function SalesForm({ onSave, onCancel }: SalesFormProps) {
  const [formData, setFormData] = useState({
    type: "venta_accesorio" as "reparacion" | "venta_accesorio" | "venta_dispositivo",
    description: "",
    amount: 0,
    paymentMethod: "efectivo" as "efectivo" | "tarjeta" | "transferencia",
    clientName: "",
    jobId: "",
  })
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCompletedJobs()
  }, [])

  const loadCompletedJobs = () => {
    const jobs = jobsStorage.getAll()
    const completed = jobs.filter((job) => job.status === "completado" || job.status === "entregado")
    setCompletedJobs(completed)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }
    if (formData.amount <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0"
    }
    if (formData.type === "reparacion" && !formData.jobId) {
      newErrors.jobId = "Debe seleccionar un trabajo para las reparaciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const saleData = {
        date: new Date(),
        type: formData.type,
        description: formData.description.trim(),
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        clientName: formData.clientName.trim() || undefined,
        jobId: formData.jobId || undefined,
      }

      salesStorage.add(saleData)
      onSave()
    } catch (error) {
      console.error("Error saving sale:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Auto-completar información si se selecciona un trabajo
    if (field === "jobId" && value) {
      const selectedJob = completedJobs.find((job) => job.id === value)
      if (selectedJob) {
        setFormData((prev) => ({
          ...prev,
          type: "reparacion",
          description: `Reparación: ${selectedJob.problem}`,
          amount: selectedJob.finalCost || selectedJob.estimatedCost,
          clientName: selectedJob.clientName,
        }))
      }
    }

    // Limpiar jobId si se cambia el tipo
    if (field === "type" && value !== "reparacion") {
      setFormData((prev) => ({ ...prev, jobId: "" }))
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reparacion":
        return "Reparación"
      case "venta_accesorio":
        return "Venta de Accesorio"
      case "venta_dispositivo":
        return "Venta de Dispositivo"
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Nueva Venta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Venta *</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="venta_accesorio">Venta de Accesorio</option>
              <option value="venta_dispositivo">Venta de Dispositivo</option>
              <option value="reparacion">Reparación Completada</option>
            </select>
          </div>

          {/* Trabajo relacionado (solo para reparaciones) */}
          {formData.type === "reparacion" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trabajo Completado *</label>
              <select
                value={formData.jobId}
                onChange={(e) => handleInputChange("jobId", e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jobId ? "border-red-500" : ""}`}
              >
                <option value="">Seleccionar trabajo</option>
                {completedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.clientName} - {job.deviceBrand} {job.deviceModel} - $
                    {(job.finalCost || job.estimatedCost).toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId}</p>}
              <p className="text-sm text-gray-500 mt-1">Solo se muestran trabajos completados o entregados</p>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={
                formData.type === "reparacion"
                  ? "Se completará automáticamente al seleccionar un trabajo"
                  : "Describe el producto o servicio vendido"
              }
              className={errors.description ? "border-red-500" : ""}
              disabled={formData.type === "reparacion" && formData.jobId !== ""}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Monto y método de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={errors.amount ? "border-red-500" : ""}
                disabled={formData.type === "reparacion" && formData.jobId !== ""}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <Input
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              placeholder="Nombre del cliente (opcional)"
              disabled={formData.type === "reparacion" && formData.jobId !== ""}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.type === "reparacion"
                ? "Se completará automáticamente al seleccionar un trabajo"
                : "Opcional - útil para seguimiento de clientes"}
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Resumen de la Venta</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span>{getTypeLabel(formData.type)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto:</span>
                <span className="font-medium">${formData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Método de Pago:</span>
                <span>{getPaymentLabel(formData.paymentMethod)}</span>
              </div>
              {formData.clientName && (
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span>{formData.clientName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Registrando..." : "Registrar Venta"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
