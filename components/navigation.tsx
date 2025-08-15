"use client"

import { useState, useEffect } from "react"
import { Package, Wrench, Shield, TrendingUp, Menu, X, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "jobs", label: "Trabajos", icon: Wrench },
    { id: "warranties", label: "Garantías", icon: Shield },
    { id: "sales", label: "Ventas", icon: TrendingUp },
  ]

  const handleViewChange = (view: string) => {
    onViewChange(view)
    setIsOpen(false)
  }

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  // Evitar scroll en body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Header móvil */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between lg:hidden">
        <h1 className="text-xl font-bold">TMultiDigital</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-blue-700"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Sidebar desktop - visible solo en lg+ */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-blue-600 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">TallerCell Pro</h1>
          <p className="text-blue-200 text-sm mt-1">Sistema de Gestión</p>
        </div>

        <div className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-700 hover:text-white"
                }`}
                aria-current={currentView === item.id ? "page" : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Menú móvil deslizante con animación */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fondo oscuro con transición */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel lateral */}
          <nav
            className="fixed left-0 top-0 h-full w-64 bg-blue-600 text-white transform transition-transform duration-300 ease-in-out shadow-xl"
          >
            <div className="p-6 border-b border-blue-500">
              <h1 className="text-2xl font-bold">TallerCell Pro</h1>
              <p className="text-blue-200 text-sm mt-1">Sistema de Gestión</p>
            </div>

            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? "bg-blue-700 text-white"
                        : "text-blue-200 hover:bg-blue-700 hover:text-white"
                    }`}
                    aria-current={currentView === item.id ? "page" : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}