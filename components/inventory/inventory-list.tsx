"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, AlertTriangle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { inventoryStorage } from "@/lib/storage"
import type { InventoryItem } from "@/lib/types"

interface InventoryListProps {
  onAddNew: () => void
  onEdit: (item: InventoryItem) => void
}

export default function InventoryList({ onAddNew, onEdit }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, selectedCategory])

  const loadItems = async () => {
    try {
      setLoading(true)
      const allItems = await inventoryStorage.getAll()
      if (Array.isArray(allItems)) {
        setItems(allItems)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error("Error loading inventory items:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await inventoryStorage.delete(id)
        await loadItems()
      } catch (error) {
        console.error("Error deleting inventory item:", error)
        alert("Error al eliminar el producto. Inténtalo de nuevo.")
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "pantalla":
        return "bg-blue-100 text-blue-800"
      case "bateria":
        return "bg-green-100 text-green-800"
      case "accesorio":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "pantalla":
        return "Pantalla"
      case "bateria":
        return "Batería"
      case "accesorio":
        return "Accesorio"
      default:
        return category
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mb-2 md:mb-4 mx-auto animate-pulse" />
            <p className="text-sm md:text-base text-gray-600">Cargando inventario...</p>
          </div>
        </div>
      </div>
    )
  }

  const lowStockItems = filteredItems.filter((item) => item.stock <= item.minStock)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Inventario</h2>
          <p className="text-sm md:text-base text-gray-600">
            {filteredItems.length} productos • {lowStockItems.length} con stock bajo
          </p>
        </div>
        <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto touch-manipulation">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* Alertas de stock bajo */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-sm md:text-base text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 md:space-y-2">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-xs md:text-sm truncate mr-2">
                    {item.name} - {item.brand} {item.model}
                  </span>
                  <Badge variant="outline" className="text-xs text-orange-700 border-orange-300 shrink-0">
                    {item.stock} restantes
                  </Badge>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <p className="text-xs md:text-sm text-orange-700">y {lowStockItems.length - 3} productos más...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm md:text-base"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base touch-manipulation"
        >
          <option value="all">Todas las categorías</option>
          <option value="pantalla">Pantallas</option>
          <option value="bateria">Baterías</option>
          <option value="accesorio">Accesorios</option>
        </select>
      </div>

      {/* Lista de productos */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mb-2 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-sm md:text-base text-gray-600 text-center mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "No se encontraron productos con los filtros aplicados"
                : "Comienza agregando tu primer producto al inventario"}
            </p>
            <Button onClick={onAddNew} variant="outline" className="touch-manipulation bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{item.name}</CardTitle>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {item.brand} {item.model}
                    </p>
                  </div>
                  <Badge className={`${getCategoryColor(item.category)} text-xs shrink-0`}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">Stock:</span>
                  <span
                    className={`text-sm md:text-base font-medium ${item.stock <= item.minStock ? "text-orange-600" : "text-green-600"}`}
                  >
                    {item.stock} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">Precio:</span>
                  <span className="text-sm md:text-base font-medium">${item.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-gray-600">Stock mínimo:</span>
                  <span className="text-xs md:text-sm">{item.minStock}</span>
                </div>
                <div className="flex gap-2 pt-1 md:pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="flex-1 text-xs md:text-sm touch-manipulation"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
