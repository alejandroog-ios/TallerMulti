import type { InventoryItem, Job, Warranty, DailySale } from "./types"
import { DatabaseService } from "./database"

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

export const inventoryStorage = {
  getAll: async (): Promise<InventoryItem[]> => {
    try {
      // Intentar obtener de Supabase primero
      const supabaseData = await DatabaseService.getInventory()
      if (supabaseData.length > 0) {
        // Sincronizar con localStorage
        saveToStorage(STORAGE_KEYS.INVENTORY, supabaseData)
        return supabaseData
      }
    } catch (error) {
      console.error("Error fetching from Supabase, using localStorage:", error)
    }

    // Usar localStorage como respaldo
    return getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY)
  },

  save: (items: InventoryItem[]) => saveToStorage(STORAGE_KEYS.INVENTORY, items),

  add: async (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): Promise<InventoryItem> => {
    try {
      // Intentar agregar a Supabase primero
      const supabaseItem = await DatabaseService.addInventoryItem(item)
      if (supabaseItem) {
        // Sincronizar con localStorage
        const localItems = getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY)
        localItems.push(supabaseItem)
        saveToStorage(STORAGE_KEYS.INVENTORY, localItems)
        return supabaseItem
      }
    } catch (error) {
      console.error("Error adding to Supabase, using localStorage:", error)
    }

    // Usar localStorage como respaldo
    const items = getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY)
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    items.push(newItem)
    saveToStorage(STORAGE_KEYS.INVENTORY, items)
    return newItem
  },

  update: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    try {
      // Intentar actualizar en Supabase primero
      const supabaseItem = await DatabaseService.updateInventoryItem(id, updates)
      if (supabaseItem) {
        // Sincronizar con localStorage
        const localItems = getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY)
        const index = localItems.findIndex((item) => item.id === id)
        if (index !== -1) {
          localItems[index] = supabaseItem
          saveToStorage(STORAGE_KEYS.INVENTORY, localItems)
        }
        return supabaseItem
      }
    } catch (error) {
      console.error("Error updating in Supabase, using localStorage:", error)
    }

    // Usar localStorage como respaldo
    const items = getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY)
    const index = items.findIndex((item) => item.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() }
      saveToStorage(STORAGE_KEYS.INVENTORY, items)
      return items[index]
    }
    return null
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      // Intentar eliminar de Supabase primero
      const success = await DatabaseService.deleteInventoryItem(id)
      if (success) {
        // Sincronizar con localStorage
        const items = getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY).filter((item) => item.id !== id)
        saveToStorage(STORAGE_KEYS.INVENTORY, items)
        return true
      }
    } catch (error) {
      console.error("Error deleting from Supabase, using localStorage:", error)
    }

    // Usar localStorage como respaldo
    const items = getFromStorage<InventoryItem>(STORAGE_KEYS.INVENTORY).filter((item) => item.id !== id)
    saveToStorage(STORAGE_KEYS.INVENTORY, items)
    return true
  },
}

export const jobsStorage = {
  getAll: async (): Promise<Job[]> => {
    try {
      const supabaseData = await DatabaseService.getJobs()
      if (supabaseData.length > 0) {
        saveToStorage(STORAGE_KEYS.JOBS, supabaseData)
        return supabaseData
      }
    } catch (error) {
      console.error("Error fetching jobs from Supabase, using localStorage:", error)
    }

    return getFromStorage<Job>(STORAGE_KEYS.JOBS)
  },

  save: (jobs: Job[]) => saveToStorage(STORAGE_KEYS.JOBS, jobs),

  add: async (job: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> => {
    try {
      const supabaseJob = await DatabaseService.addJob(job)
      if (supabaseJob) {
        const localJobs = getFromStorage<Job>(STORAGE_KEYS.JOBS)
        localJobs.push(supabaseJob)
        saveToStorage(STORAGE_KEYS.JOBS, localJobs)
        return supabaseJob
      }
    } catch (error) {
      console.error("Error adding job to Supabase, using localStorage:", error)
    }

    const jobs = getFromStorage<Job>(STORAGE_KEYS.JOBS)
    const newJob: Job = {
      ...job,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    jobs.push(newJob)
    saveToStorage(STORAGE_KEYS.JOBS, jobs)
    return newJob
  },

  update: async (id: string, updates: Partial<Job>): Promise<Job | null> => {
    try {
      const supabaseJob = await DatabaseService.updateJob(id, updates)
      if (supabaseJob) {
        const localJobs = getFromStorage<Job>(STORAGE_KEYS.JOBS)
        const index = localJobs.findIndex((job) => job.id === id)
        if (index !== -1) {
          localJobs[index] = supabaseJob
          saveToStorage(STORAGE_KEYS.JOBS, localJobs)
        }
        return supabaseJob
      }
    } catch (error) {
      console.error("Error updating job in Supabase, using localStorage:", error)
    }

    const jobs = getFromStorage<Job>(STORAGE_KEYS.JOBS)
    const index = jobs.findIndex((job) => job.id === id)
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates, updatedAt: new Date().toISOString() }
      saveToStorage(STORAGE_KEYS.JOBS, jobs)
      return jobs[index]
    }
    return null
  },

  delete: async (id: string): Promise<boolean> => {
    const jobs = getFromStorage<Job>(STORAGE_KEYS.JOBS).filter((job) => job.id !== id)
    saveToStorage(STORAGE_KEYS.JOBS, jobs)
    return true
  },
}

export const warrantiesStorage = {
  getAll: async (): Promise<Warranty[]> => {
    try {
      const supabaseData = await DatabaseService.getWarranties()
      if (supabaseData.length > 0) {
        saveToStorage(STORAGE_KEYS.WARRANTIES, supabaseData)
        return supabaseData
      }
    } catch (error) {
      console.error("Error fetching warranties from Supabase, using localStorage:", error)
    }

    return getFromStorage<Warranty>(STORAGE_KEYS.WARRANTIES)
  },

  save: (warranties: Warranty[]) => saveToStorage(STORAGE_KEYS.WARRANTIES, warranties),

  add: async (warranty: Omit<Warranty, "id" | "createdAt" | "updatedAt">): Promise<Warranty> => {
    try {
      const supabaseWarranty = await DatabaseService.addWarranty(warranty)
      if (supabaseWarranty) {
        const localWarranties = getFromStorage<Warranty>(STORAGE_KEYS.WARRANTIES)
        localWarranties.push(supabaseWarranty)
        saveToStorage(STORAGE_KEYS.WARRANTIES, localWarranties)
        return supabaseWarranty
      }
    } catch (error) {
      console.error("Error adding warranty to Supabase, using localStorage:", error)
    }

    const warranties = getFromStorage<Warranty>(STORAGE_KEYS.WARRANTIES)
    const newWarranty: Warranty = {
      ...warranty,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    warranties.push(newWarranty)
    saveToStorage(STORAGE_KEYS.WARRANTIES, warranties)
    return newWarranty
  },

  update: async (id: string, updates: Partial<Warranty>): Promise<Warranty | null> => {
    const warranties = getFromStorage<Warranty>(STORAGE_KEYS.WARRANTIES)
    const index = warranties.findIndex((warranty) => warranty.id === id)
    if (index !== -1) {
      warranties[index] = { ...warranties[index], ...updates, updatedAt: new Date().toISOString() }
      saveToStorage(STORAGE_KEYS.WARRANTIES, warranties)
      return warranties[index]
    }
    return null
  },
}

export const salesStorage = {
  getAll: async (): Promise<DailySale[]> => {
    try {
      const supabaseData = await DatabaseService.getDailySales()
      if (supabaseData.length > 0) {
        saveToStorage(STORAGE_KEYS.SALES, supabaseData)
        return supabaseData
      }
    } catch (error) {
      console.error("Error fetching sales from Supabase, using localStorage:", error)
    }

    return getFromStorage<DailySale>(STORAGE_KEYS.SALES)
  },

  save: (sales: DailySale[]) => saveToStorage(STORAGE_KEYS.SALES, sales),

  add: async (sale: Omit<DailySale, "id" | "createdAt">): Promise<DailySale> => {
    try {
      const supabaseSale = await DatabaseService.addDailySale(sale)
      if (supabaseSale) {
        const localSales = getFromStorage<DailySale>(STORAGE_KEYS.SALES)
        localSales.push(supabaseSale)
        saveToStorage(STORAGE_KEYS.SALES, localSales)
        return supabaseSale
      }
    } catch (error) {
      console.error("Error adding sale to Supabase, using localStorage:", error)
    }

    const sales = getFromStorage<DailySale>(STORAGE_KEYS.SALES)
    const newSale: DailySale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    sales.push(newSale)
    saveToStorage(STORAGE_KEYS.SALES, sales)
    return newSale
  },

  getByDate: async (date: string): Promise<DailySale[]> => {
    const allSales = await salesStorage.getAll()
    return allSales.filter((sale) => new Date(sale.date).toDateString() === new Date(date).toDateString())
  },
}
