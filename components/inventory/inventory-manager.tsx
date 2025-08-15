"use client"

import { useState } from "react"
import InventoryList from "./inventory-list"
import InventoryForm from "./inventory-form"
import type { InventoryItem } from "@/lib/types"

export default function InventoryManager() {
  const [currentView, setCurrentView] = useState<"list" | "form">("list")
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>()

  const handleAddNew = () => {
    setEditingItem(undefined)
    setCurrentView("form")
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setCurrentView("form")
  }

  const handleSave = () => {
    setCurrentView("list")
    setEditingItem(undefined)
  }

  const handleCancel = () => {
    setCurrentView("list")
    setEditingItem(undefined)
  }

  if (currentView === "form") {
    return <InventoryForm item={editingItem} onSave={handleSave} onCancel={handleCancel} />
  }

  return <InventoryList onAddNew={handleAddNew} onEdit={handleEdit} />
}
