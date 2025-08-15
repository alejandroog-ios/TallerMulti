import type { InventoryItem, Job, Warranty, DailySale } from "./types"

// Claves para localStorage
const STORAGE_KEYS = {
  INVENTORY: "taller_inventory",
  JOBS: "taller_jobs",
  WARRANTIES: "taller_warranties",
  SALES: "taller_sales",
  SETTINGS: "taller_settings",
} as const

// Funciones genéricas para localStorage
function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return []
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
  }
}

// Funciones para inventario
export const inventoryStorage = {
  getAll: (): InventoryItem[] => getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY),
  save: (items: InventoryItem[]) => saveToStorage(STORAGE_KEYS.INVENTORY, items),
  add: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
    const items = inventoryStorage.getAll()
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    items.push(newItem)
    inventoryStorage.save(items)
    return newItem
  },
  update: (id: string, updates: Partial<InventoryItem>) => {
    const items = inventoryStorage.getAll()
    const index = items.findIndex((item) => item.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date() }
      inventoryStorage.save(items)
      return items[index]
    }
    return null
  },
  delete: (id: string) => {
    const items = inventoryStorage.getAll().filter((item) => item.id !== id)
    inventoryStorage.save(items)
  },
}

// Funciones para trabajos
export const jobsStorage = {
  getAll: (): Job[] => getFromStorage<Job>(STORAGE_KEYS.JOBS),
  save: (jobs: Job[]) => saveToStorage(STORAGE_KEYS.JOBS, jobs),
  add: (job: Omit<Job, "id" | "startDate">) => {
    const jobs = jobsStorage.getAll()
    const newJob: Job = {
      ...job,
      id: Date.now().toString(),
      startDate: new Date(),
    }
    jobs.push(newJob)
    jobsStorage.save(jobs)
    return newJob
  },
  update: (id: string, updates: Partial<Job>) => {
    const jobs = jobsStorage.getAll()
    const index = jobs.findIndex((job) => job.id === id)
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates }
      jobsStorage.save(jobs)
      return jobs[index]
    }
    return null
  },
  delete: (id: string) => {
    const jobs = jobsStorage.getAll().filter((job) => job.id !== id)
    jobsStorage.save(jobs)
  },
}

// Funciones para garantías
export const warrantiesStorage = {
  getAll: (): Warranty[] => getFromStorage<Warranty>(STORAGE_KEYS.WARRANTIES),
  save: (warranties: Warranty[]) => saveToStorage(STORAGE_KEYS.WARRANTIES, warranties),
  add: (warranty: Omit<Warranty, "id">) => {
    const warranties = warrantiesStorage.getAll()
    const newWarranty: Warranty = {
      ...warranty,
      id: Date.now().toString(),
    }
    warranties.push(newWarranty)
    warrantiesStorage.save(warranties)
    return newWarranty
  },
  update: (id: string, updates: Partial<Warranty>) => {
    const warranties = warrantiesStorage.getAll()
    const index = warranties.findIndex((warranty) => warranty.id === id)
    if (index !== -1) {
      warranties[index] = { ...warranties[index], ...updates }
      warrantiesStorage.save(warranties)
      return warranties[index]
    }
    return null
  },
}

// Funciones para ventas
export const salesStorage = {
  getAll: (): DailySale[] => getFromStorage<DailySale>(STORAGE_KEYS.SALES),
  save: (sales: DailySale[]) => saveToStorage(STORAGE_KEYS.SALES, sales),
  add: (sale: Omit<DailySale, "id">) => {
    const sales = salesStorage.getAll()
    const newSale: DailySale = {
      ...sale,
      id: Date.now().toString(),
    }
    sales.push(newSale)
    salesStorage.save(sales)
    return newSale
  },
  getByDate: (date: string): DailySale[] => {
    return salesStorage.getAll().filter((sale) => new Date(sale.date).toDateString() === new Date(date).toDateString())
  },
}
