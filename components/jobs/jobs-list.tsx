"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Edit, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { jobsStorage } from "@/lib/storage"
import type { Job } from "@/lib/types"

interface JobsListProps {
  onAddNew: () => void
  onEdit: (job: Job) => void
  onView: (job: Job) => void
}

export default function JobsList({ onAddNew, onEdit, onView }: JobsListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, selectedStatus])

  const loadJobs = () => {
    const allJobs = jobsStorage.getAll()
    // Ordenar por fecha de inicio, más recientes primero
    allJobs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    setJobs(allJobs)
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.clientPhone.includes(searchTerm) ||
          job.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.problem.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((job) => job.status === selectedStatus)
    }

    setFilteredJobs(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "en_proceso":
        return "bg-blue-100 text-blue-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "entregado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente"
      case "en_proceso":
        return "En Proceso"
      case "completado":
        return "Completado"
      case "entregado":
        return "Entregado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "en_proceso":
        return <AlertCircle className="w-4 h-4" />
      case "completado":
        return <CheckCircle className="w-4 h-4" />
      case "entregado":
        return <Truck className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDaysElapsed = (startDate: Date | string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const statusCounts = {
    all: jobs.length,
    pendiente: jobs.filter((job) => job.status === "pendiente").length,
    en_proceso: jobs.filter((job) => job.status === "en_proceso").length,
    completado: jobs.filter((job) => job.status === "completado").length,
    entregado: jobs.filter((job) => job.status === "entregado").length,
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Trabajos</h2>
          <p className="text-gray-600">
            {filteredJobs.length} trabajos • {statusCounts.pendiente + statusCounts.en_proceso} activos
          </p>
        </div>
        <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Trabajo
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedStatus("all")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-yellow-50" onClick={() => setSelectedStatus("pendiente")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pendiente}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-blue-50" onClick={() => setSelectedStatus("en_proceso")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.en_proceso}</div>
            <div className="text-sm text-gray-600">En Proceso</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-green-50" onClick={() => setSelectedStatus("completado")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.completado}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedStatus("entregado")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.entregado}</div>
            <div className="text-sm text-gray-600">Entregados</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por cliente, teléfono, dispositivo o problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completado">Completados</option>
          <option value="entregado">Entregados</option>
        </select>
      </div>

      {/* Lista de trabajos */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || selectedStatus !== "all"
                ? "No se encontraron trabajos con los filtros aplicados"
                : "Comienza registrando tu primer trabajo de reparación"}
            </p>
            <Button onClick={onAddNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Trabajo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{job.clientName}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          {getStatusLabel(job.status)}
                        </span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Teléfono:</span> {job.clientPhone}
                      </div>
                      <div>
                        <span className="font-medium">Dispositivo:</span> {job.deviceBrand} {job.deviceModel}
                      </div>
                      <div>
                        <span className="font-medium">Problema:</span> {job.problem}
                      </div>
                      <div>
                        <span className="font-medium">Costo:</span> ${job.finalCost || job.estimatedCost}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Iniciado: {formatDate(job.startDate)}</span>
                      <span>•</span>
                      <span>{getDaysElapsed(job.startDate)} días</span>
                      {job.completionDate && (
                        <>
                          <span>•</span>
                          <span>Completado: {formatDate(job.completionDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(job)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
