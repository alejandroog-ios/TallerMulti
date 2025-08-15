"use client"

import { useState, useEffect } from "react"
import { Smartphone, Wrench, Shield, TrendingUp } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Smartphone, text: "Cargando inventario...", color: "text-blue-500" },
    { icon: Wrench, text: "Preparando trabajos...", color: "text-green-500" },
    { icon: Shield, text: "Verificando garantías...", color: "text-purple-500" },
    { icon: TrendingUp, text: "Calculando ventas...", color: "text-orange-500" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }

        const newProgress = prev + 2
        const newStep = Math.floor(newProgress / 25)
        if (newStep !== currentStep && newStep < steps.length) {
          setCurrentStep(newStep)
        }

        return newProgress
      })
    }, 50)

    return () => clearInterval(timer)
  }, [onComplete, currentStep, steps.length])

  const CurrentIcon = steps[currentStep]?.icon || Smartphone

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
      <div className="text-center space-y-8 px-8">
        {/* Logo y título */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Smartphone className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white">TallerCell Pro</h1>
          <p className="text-blue-200 text-lg">Sistema de Gestión Integral</p>
        </div>

        {/* Indicador de progreso */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <CurrentIcon className={`w-12 h-12 ${steps[currentStep]?.color || "text-blue-500"} animate-pulse`} />
          </div>

          <div className="space-y-2">
            <p className="text-white font-medium">{steps[currentStep]?.text || "Iniciando sistema..."}</p>

            {/* Barra de progreso */}
            <div className="w-80 h-2 bg-blue-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-blue-300 text-sm">{progress}%</p>
          </div>
        </div>

        {/* Características */}
        <div className="grid grid-cols-2 gap-4 text-blue-200 text-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Inventario</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>Trabajos</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Garantías</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Ventas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
