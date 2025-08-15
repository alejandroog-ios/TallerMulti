"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, List } from "lucide-react"
import SalesList from "./sales-list"
import SalesForm from "./sales-form"
import SalesReports from "./sales-reports"

export default function SalesManager() {
  const [currentView, setCurrentView] = useState<"list" | "form" | "reports">("list")

  const handleAddNew = () => {
    setCurrentView("form")
  }

  const handleSave = () => {
    setCurrentView("list")
  }

  const handleCancel = () => {
    setCurrentView("list")
  }

  if (currentView === "form") {
    return <SalesForm onSave={handleSave} onCancel={handleCancel} />
  }

  if (currentView === "reports") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView("list")}>
            <List className="w-4 h-4 mr-2" />
            Ver Lista
          </Button>
        </div>
        <SalesReports />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setCurrentView("reports")}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver Reportes
        </Button>
      </div>
      <SalesList onAddNew={handleAddNew} />
    </div>
  )
}
