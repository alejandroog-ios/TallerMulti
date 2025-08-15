"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { jobsStorage, inventoryStorage, warrantiesStorage } from "@/lib/storage"
import type { Job, InventoryItem } from "@/lib/types"

interface JobFormProps {
  job?: Job
  onSave: () => void
  onCancel: () => void
}

export default function JobForm({ job, onSave, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    deviceBrand: "",
    deviceModel: "",
    problem: "",
    diagnosis: "",
    status: "pendiente" as "pendiente" | "en_proceso" | "completado" | "entregado",
    estimatedCost: 0,
    finalCost: 0,
    notes: "",
    hasWarranty: true,
    warrantyDays: 30,
  })
  const [partsUsed, setPartsUsed] = useState<
    Array<{ itemId: string; itemName: string; quantity: number; price: number }>
  >([])
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadAvailableItems()
    if (job) {
      setFormData({
        clientName: job.clientName,
        clientPhone: job.clientPhone,
        deviceBrand: job.deviceBrand,
        deviceModel: job.deviceModel,
        problem: job.problem,
        diagnosis: job.diagnosis,
        status: job.status,
        estimatedCost: job.estimatedCost,
        finalCost: job.finalCost,
        notes: job.notes,
        hasWarranty: job.hasWarranty,
        warrantyDays: job.warrantyDays,
      })
      setPartsUsed(job.partsUsed || [])
    }
  }, [job])

  const loadAvailableItems = () => {
    const items = inventoryStorage.getAll()
    setAvailableItems(items)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = "El nombre del cliente es requerido"
    }
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = "El teléfono es requerido"
    }
    if (!formData.deviceBrand.trim()) {
      newErrors.deviceBrand = "La marca del dispositivo es requerida"
    }
    if (!formData.deviceModel.trim()) {
      newErrors.deviceModel = "El modelo del dispositivo es requerido"
    }
    if (!formData.problem.trim()) {
      newErrors.problem = "La descripción del problema es requerida"
    }
    if (formData.estimatedCost <= 0) {
      newErrors.estimatedCost = "El costo estimado debe ser mayor a 0"
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
      const jobData = {
        ...formData,
        partsUsed,
        completionDate: formData.status === "completado" || formData.status === "entregado" ? new Date() : undefined,
        deliveryDate: formData.status === "entregado" ? new Date() : undefined,
      }

      let savedJob: Job

      if (job) {
        // Actualizar trabajo existente
        savedJob = jobsStorage.update(job.id, jobData) as Job
      } else {
        // Crear nuevo trabajo
        savedJob = jobsStorage.add(jobData)
      }

      // Actualizar inventario si se usaron partes
      if (partsUsed.length > 0) {
        partsUsed.forEach((part) => {
          const item = inventoryStorage.getAll().find((i) => i.id === part.itemId)
          if (item && item.quantity >= part.quantity) {
            inventoryStorage.update(part.itemId, {
              quantity: item.quantity - part.quantity,
            })
          }
        })
      }

      // Crear garantía si el trabajo está completado y tiene garantía
      if ((formData.status === "completado" || formData.status === "entregado") && formData.hasWarranty && savedJob) {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + formData.warrantyDays)

        warrantiesStorage.add({
          jobId: savedJob.id,
          clientName: formData.clientName,
          deviceInfo: `${formData.deviceBrand} ${formData.deviceModel}`,
          workDone: formData.diagnosis || formData.problem,
          warrantyDays: formData.warrantyDays,
          startDate,
          endDate,
          isActive: true,
        })
      }

      onSave()
    } catch (error) {
      console.error("Error saving job:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addPart = () => {
    setPartsUsed((prev) => [
      ...prev,
      {
        itemId: "",
        itemName: "",
        quantity: 1,
        price: 0,
      },
    ])
  }

  const updatePart = (index: number, field: string, value: string | number) => {
    setPartsUsed((prev) => {
      const updated = [...prev]
      if (field === "itemId") {
        const item = availableItems.find((i) => i.id === value)
        if (item) {
          updated[index] = {
            ...updated[index],
            itemId: item.id,
            itemName: item.name,
            price: item.price,
          }
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const removePart = (index: number) => {
    setPartsUsed((prev) => prev.filter((_, i) => i !== index))
  }

  const totalPartsCost = partsUsed.reduce((sum, part) => sum + part.price * part.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{job ? "Editar Trabajo" : "Nuevo Trabajo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del cliente */}
            <div>
              <h3 className="text-lg font-medium mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    placeholder="Nombre completo"
                    className={errors.clientName ? "border-red-500" : ""}
                  />
                  {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                    placeholder="Número de teléfono"
                    className={errors.clientPhone ? "border-red-500" : ""}
                  />
                  {errors.clientPhone && <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>}
                </div>
              </div>
            </div>

            {/* Información del dispositivo */}
            <div>
              <h3 className="text-lg font-medium mb-4">Información del Dispositivo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <Input
                    value={formData.deviceBrand}
                    onChange={(e) => handleInputChange("deviceBrand", e.target.value)}
                    placeholder="Samsung, Apple, Huawei..."
                    className={errors.deviceBrand ? "border-red-500" : ""}
                  />
                  {errors.deviceBrand && <p className="text-red-500 text-sm mt-1">{errors.deviceBrand}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <Input
                    value={formData.deviceModel}
                    onChange={(e) => handleInputChange("deviceModel", e.target.value)}
                    placeholder="Galaxy S21, iPhone 12..."
                    className={errors.deviceModel ? "border-red-500" : ""}
                  />
                  {errors.deviceModel && <p className="text-red-500 text-sm mt-1">{errors.deviceModel}</p>}
                </div>
              </div>
            </div>

            {/* Detalles del trabajo */}
            <div>
              <h3 className="text-lg font-medium mb-4">Detalles del Trabajo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problema Reportado *</label>
                  <Textarea
                    value={formData.problem}
                    onChange={(e) => handleInputChange("problem", e.target.value)}
                    placeholder="Describe el problema reportado por el cliente"
                    className={errors.problem ? "border-red-500" : ""}
                  />
                  {errors.problem && <p className="text-red-500 text-sm mt-1">{errors.problem}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                  <Textarea
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                    placeholder="Diagnóstico técnico y trabajo realizado"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completado">Completado</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado *</label>
                    <Input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange("estimatedCost", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={errors.estimatedCost ? "border-red-500" : ""}
                    />
                    {errors.estimatedCost && <p className="text-red-500 text-sm mt-1">{errors.estimatedCost}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo Final</label>
                    <Input
                      type="number"
                      value={formData.finalCost}
                      onChange={(e) => handleInputChange("finalCost", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Notas adicionales sobre el trabajo"
                  />
                </div>
              </div>
            </div>

            {/* Partes utilizadas */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Partes Utilizadas</h3>
                <Button type="button" variant="outline" size="sm" onClick={addPart}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Parte
                </Button>
              </div>
              {partsUsed.length > 0 && (
                <div className="space-y-3">
                  {partsUsed.map((part, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select
                          value={part.itemId}
                          onChange={(e) => updatePart(index, "itemId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar producto</option>
                          {availableItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} - {item.brand} {item.model} (Stock: {item.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <Input
                          type="number"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, "quantity", Number.parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unit.</label>
                        <Input
                          type="number"
                          value={part.price}
                          onChange={(e) => updatePart(index, "price", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removePart(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="text-right">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Total partes: ${totalPartsCost.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Garantía */}
            <div>
              <h3 className="text-lg font-medium mb-4">Garantía</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasWarranty"
                    checked={formData.hasWarranty}
                    onChange={(e) => handleInputChange("hasWarranty", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="hasWarranty" className="text-sm font-medium text-gray-700">
                    Este trabajo incluye garantía
                  </label>
                </div>
                {formData.hasWarranty && (
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días de Garantía</label>
                    <Input
                      type="number"
                      value={formData.warrantyDays}
                      onChange={(e) => handleInputChange("warrantyDays", Number.parseInt(e.target.value) || 30)}
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Guardando..." : job ? "Actualizar" : "Crear Trabajo"}
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
