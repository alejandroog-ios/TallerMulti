"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { inventoryStorage } from "@/lib/storage"
import type { InventoryItem } from "@/lib/types"

interface InventoryFormProps {
  item?: InventoryItem
  onSave: () => void
  onCancel: () => void
}

export default function InventoryForm({ item, onSave, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "pantalla" as "pantalla" | "bateria" | "accesorio",
    brand: "",
    model: "",
    stock: 0,
    price: 0,
    minStock: 5,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "pantalla",
        brand: item.brand || "",
        model: item.model || "",
        stock: item.stock ?? 0,
        price: item.price ?? 0,
        minStock: item.minStock ?? 5,
      })
    }
  }, [item])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }
    if (!formData.brand.trim()) {
      newErrors.brand = "La marca es requerida"
    }
    if (!formData.model.trim()) {
      newErrors.model = "El modelo es requerido"
    }
    if (formData.stock < 0) {
      newErrors.stock = "El stock no puede ser negativo"
    }
    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }
    if (formData.minStock < 0) {
      newErrors.minStock = "El stock mínimo no puede ser negativo"
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
      if (item) {
        // Actualizar producto existente
        inventoryStorage.update(item.id, formData)
      } else {
        // Crear nuevo producto
        inventoryStorage.add(formData)
      }
      onSave()
    } catch (error) {
      console.error("Error saving inventory item:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? (typeof prev[field as keyof typeof prev] === "number" ? 0 : "") : value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{item ? "Editar Producto" : "Agregar Nuevo Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Pantalla LCD"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pantalla">Pantalla</option>
                <option value="bateria">Batería</option>
                <option value="accesorio">Accesorio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <Input
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="Ej: Samsung, Apple, Huawei"
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <Input
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="Ej: Galaxy S21, iPhone 12"
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual *</label>
              <Input
                type="number"
                value={formData.stock.toString()}
                onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
                min="0"
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <Input
                type="number"
                value={formData.price.toString()}
                onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
              <Input
                type="number"
                value={formData.minStock.toString()}
                onChange={(e) => handleInputChange("minStock", Number.parseInt(e.target.value) || 0)}
                min="0"
                className={errors.minStock ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-500 mt-1">
                Se mostrará una alerta cuando el stock esté por debajo de este número
              </p>
              {errors.minStock && <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Guardando..." : item ? "Actualizar" : "Agregar"}
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
