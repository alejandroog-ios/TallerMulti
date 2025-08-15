// Tipos para el inventario
export interface InventoryItem {
  id: string
  name: string
  category: "pantalla" | "bateria" | "accesorio"
  brand: string
  model: string
  quantity: number
  price: number
  minStock: number
  createdAt: Date
  updatedAt: Date
}

// Tipos para trabajos
export interface Job {
  id: string
  clientName: string
  clientPhone: string
  deviceBrand: string
  deviceModel: string
  problem: string
  diagnosis: string
  status: "pendiente" | "en_proceso" | "completado" | "entregado"
  estimatedCost: number
  finalCost: number
  partsUsed: Array<{
    itemId: string
    itemName: string
    quantity: number
    price: number
  }>
  startDate: Date
  completionDate?: Date
  deliveryDate?: Date
  notes: string
  hasWarranty: boolean
  warrantyDays: number
}

// Tipos para garantías
export interface Warranty {
  id: string
  jobId: string
  clientName: string
  deviceInfo: string
  workDone: string
  warrantyDays: number
  startDate: Date
  endDate: Date
  isActive: boolean
  claimDate?: Date
  claimReason?: string
}

// Tipos para ventas diarias
export interface DailySale {
  id: string
  date: Date
  type: "reparacion" | "venta_accesorio" | "venta_dispositivo"
  description: string
  amount: number
  paymentMethod: "efectivo" | "tarjeta" | "transferencia"
  clientName?: string
  jobId?: string
}

// Tipo para resumen diario
export interface DailySummary {
  date: string
  totalSales: number
  totalJobs: number
  totalRevenue: number
  paymentBreakdown: {
    efectivo: number
    tarjeta: number
    transferencia: number
  }
}
