import { supabase } from "./supabase/client"
import type { InventoryItem, Job, Warranty, DailySale } from "./types"

export class DatabaseService {
  // Inventario
  static async getInventory(): Promise<InventoryItem[]> {
    if (!supabase) return []

    const { data, error } = await supabase.from("inventory").select("*").order("name")

    if (error) {
      console.error("Error fetching inventory:", error)
      return []
    }

    return data || []
  }

  static async addInventoryItem(
    item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<InventoryItem | null> {
    if (!supabase) return null

    const { data, error } = await supabase
      .from("inventory")
      .insert([
        {
          name: item.name,
          category: item.category,
          brand: item.brand,
          model: item.model,
          price: item.price,
          stock: item.stock,
          min_stock: item.minStock,
          description: item.description,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding inventory item:", error)
      return null
    }

    return this.mapInventoryFromDB(data)
  }

  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    if (!supabase) return null

    const dbUpdates: any = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.category) dbUpdates.category = updates.category
    if (updates.brand) dbUpdates.brand = updates.brand
    if (updates.model) dbUpdates.model = updates.model
    if (updates.price !== undefined) dbUpdates.price = updates.price
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock
    if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock
    if (updates.description) dbUpdates.description = updates.description

    const { data, error } = await supabase.from("inventory").update(dbUpdates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating inventory item:", error)
      return null
    }

    return this.mapInventoryFromDB(data)
  }

  static async deleteInventoryItem(id: string): Promise<boolean> {
    if (!supabase) return false

    const { error } = await supabase.from("inventory").delete().eq("id", id)

    if (error) {
      console.error("Error deleting inventory item:", error)
      return false
    }

    return true
  }

  // Trabajos
  static async getJobs(): Promise<Job[]> {
    if (!supabase) return []

    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching jobs:", error)
      return []
    }

    return data?.map(this.mapJobFromDB) || []
  }

  static async addJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job | null> {
    if (!supabase) return null

    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          customer_name: job.customerName,
          customer_phone: job.customerPhone,
          device_brand: job.deviceBrand,
          device_model: job.deviceModel,
          problem_description: job.problemDescription,
          diagnosis: job.diagnosis,
          solution: job.solution,
          status: job.status,
          labor_cost: job.laborCost,
          parts_cost: job.partsCost,
          total_cost: job.totalCost,
          estimated_completion: job.estimatedCompletion,
          actual_completion: job.actualCompletion,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding job:", error)
      return null
    }

    return this.mapJobFromDB(data)
  }

  static async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    if (!supabase) return null

    const dbUpdates: any = {}
    if (updates.customerName) dbUpdates.customer_name = updates.customerName
    if (updates.customerPhone) dbUpdates.customer_phone = updates.customerPhone
    if (updates.deviceBrand) dbUpdates.device_brand = updates.deviceBrand
    if (updates.deviceModel) dbUpdates.device_model = updates.deviceModel
    if (updates.problemDescription) dbUpdates.problem_description = updates.problemDescription
    if (updates.diagnosis) dbUpdates.diagnosis = updates.diagnosis
    if (updates.solution) dbUpdates.solution = updates.solution
    if (updates.status) dbUpdates.status = updates.status
    if (updates.laborCost !== undefined) dbUpdates.labor_cost = updates.laborCost
    if (updates.partsCost !== undefined) dbUpdates.parts_cost = updates.partsCost
    if (updates.totalCost !== undefined) dbUpdates.total_cost = updates.totalCost
    if (updates.estimatedCompletion) dbUpdates.estimated_completion = updates.estimatedCompletion
    if (updates.actualCompletion) dbUpdates.actual_completion = updates.actualCompletion

    const { data, error } = await supabase.from("jobs").update(dbUpdates).eq("id", id).select("*").single()

    if (error) {
      console.error("Error updating job:", error)
      return null
    }

    return this.mapJobFromDB(data)
  }

  // Garantías
  static async getWarranties(): Promise<Warranty[]> {
    if (!supabase) return []

    const { data, error } = await supabase
      .from("warranties")
      .select(`
        *,
        jobs (
          customer_name,
          device_brand,
          device_model
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching warranties:", error)
      return []
    }

    return data?.map(this.mapWarrantyFromDB) || []
  }

  static async addWarranty(warranty: Omit<Warranty, "id" | "createdAt" | "updatedAt">): Promise<Warranty | null> {
    if (!supabase) return null

    const { data, error } = await supabase
      .from("warranties")
      .insert([
        {
          job_id: warranty.jobId,
          warranty_months: warranty.warrantyMonths,
          start_date: warranty.startDate,
          end_date: warranty.endDate,
          status: warranty.status,
          claim_description: warranty.claimDescription,
          claim_date: warranty.claimDate,
          resolution: warranty.resolution,
        },
      ])
      .select(`
        *,
        jobs (
          customer_name,
          device_brand,
          device_model
        )
      `)
      .single()

    if (error) {
      console.error("Error adding warranty:", error)
      return null
    }

    return this.mapWarrantyFromDB(data)
  }

  // Ventas diarias
  static async getDailySales(): Promise<DailySale[]> {
    if (!supabase) return []

    const { data, error } = await supabase.from("daily_sales").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error fetching daily sales:", error)
      return []
    }

    return data?.map(this.mapSaleFromDB) || []
  }

  static async addDailySale(sale: Omit<DailySale, "id" | "createdAt">): Promise<DailySale | null> {
    if (!supabase) return null

    const { data, error } = await supabase
      .from("daily_sales")
      .insert([
        {
          date: sale.date,
          type: sale.type,
          description: sale.description,
          amount: sale.amount,
          payment_method: sale.paymentMethod,
          job_id: sale.jobId,
          inventory_id: sale.inventoryId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding daily sale:", error)
      return null
    }

    return this.mapSaleFromDB(data)
  }

  // Funciones de mapeo para convertir entre formato DB y formato de la app
  private static mapInventoryFromDB(dbItem: any): InventoryItem {
    return {
      id: dbItem.id,
      name: dbItem.name,
      category: dbItem.category,
      brand: dbItem.brand,
      model: dbItem.model,
      price: dbItem.price,
      stock: dbItem.stock,
      minStock: dbItem.min_stock,
      description: dbItem.description,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
    }
  }

  private static mapJobFromDB(dbJob: any): Job {
    return {
      id: dbJob.id,
      customerName: dbJob.customer_name,
      customerPhone: dbJob.customer_phone,
      deviceBrand: dbJob.device_brand,
      deviceModel: dbJob.device_model,
      problemDescription: dbJob.problem_description,
      diagnosis: dbJob.diagnosis,
      solution: dbJob.solution,
      status: dbJob.status,
      laborCost: dbJob.labor_cost,
      partsCost: dbJob.parts_cost,
      totalCost: dbJob.total_cost,
      estimatedCompletion: dbJob.estimated_completion,
      actualCompletion: dbJob.actual_completion,
      parts: [],
      createdAt: dbJob.created_at,
      updatedAt: dbJob.updated_at,
    }
  }

  private static mapWarrantyFromDB(dbWarranty: any): Warranty {
    return {
      id: dbWarranty.id,
      jobId: dbWarranty.job_id,
      customerName: dbWarranty.jobs?.customer_name || "",
      deviceInfo: `${dbWarranty.jobs?.device_brand || ""} ${dbWarranty.jobs?.device_model || ""}`.trim(),
      warrantyMonths: dbWarranty.warranty_months,
      startDate: dbWarranty.start_date,
      endDate: dbWarranty.end_date,
      status: dbWarranty.status,
      claimDescription: dbWarranty.claim_description,
      claimDate: dbWarranty.claim_date,
      resolution: dbWarranty.resolution,
      createdAt: dbWarranty.created_at,
      updatedAt: dbWarranty.updated_at,
    }
  }

  private static mapSaleFromDB(dbSale: any): DailySale {
    return {
      id: dbSale.id,
      date: dbSale.date,
      type: dbSale.type,
      description: dbSale.description,
      amount: dbSale.amount,
      paymentMethod: dbSale.payment_method,
      jobId: dbSale.job_id,
      inventoryId: dbSale.inventory_id,
      createdAt: dbSale.created_at,
    }
  }
}
