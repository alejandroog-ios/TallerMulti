"use client"

import { useState } from "react"
import WarrantiesList from "./warranties-list"
import WarrantyDetail from "./warranty-detail"
import WarrantyClaimForm from "./warranty-claim-form"
import type { Warranty } from "@/lib/types"

export default function WarrantiesManager() {
  const [currentView, setCurrentView] = useState<"list" | "detail" | "claim">("list")
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | undefined>()

  const handleView = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setCurrentView("detail")
  }

  const handleProcessClaim = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setCurrentView("claim")
  }

  const handleSave = () => {
    setCurrentView("list")
    setSelectedWarranty(undefined)
  }

  const handleCancel = () => {
    setCurrentView("list")
    setSelectedWarranty(undefined)
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedWarranty(undefined)
  }

  const handleProcessClaimFromDetail = () => {
    setCurrentView("claim")
  }

  if (currentView === "claim" && selectedWarranty) {
    return <WarrantyClaimForm warranty={selectedWarranty} onSave={handleSave} onCancel={handleCancel} />
  }

  if (currentView === "detail" && selectedWarranty) {
    return (
      <WarrantyDetail warranty={selectedWarranty} onBack={handleBack} onProcessClaim={handleProcessClaimFromDetail} />
    )
  }

  return <WarrantiesList onView={handleView} onProcessClaim={handleProcessClaim} />
}
