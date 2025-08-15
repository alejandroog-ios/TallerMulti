"use client"

import { useState } from "react"
import JobsList from "./jobs-list"
import JobForm from "./job-form"
import JobDetail from "./job-detail"
import type { Job } from "@/lib/types"

export default function JobsManager() {
  const [currentView, setCurrentView] = useState<"list" | "form" | "detail">("list")
  const [selectedJob, setSelectedJob] = useState<Job | undefined>()

  const handleAddNew = () => {
    setSelectedJob(undefined)
    setCurrentView("form")
  }

  const handleEdit = (job: Job) => {
    setSelectedJob(job)
    setCurrentView("form")
  }

  const handleView = (job: Job) => {
    setSelectedJob(job)
    setCurrentView("detail")
  }

  const handleSave = () => {
    setCurrentView("list")
    setSelectedJob(undefined)
  }

  const handleCancel = () => {
    setCurrentView("list")
    setSelectedJob(undefined)
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedJob(undefined)
  }

  const handleEditFromDetail = () => {
    setCurrentView("form")
  }

  if (currentView === "form") {
    return <JobForm job={selectedJob} onSave={handleSave} onCancel={handleCancel} />
  }

  if (currentView === "detail" && selectedJob) {
    return <JobDetail job={selectedJob} onBack={handleBack} onEdit={handleEditFromDetail} />
  }

  return <JobsList onAddNew={handleAddNew} onEdit={handleEdit} onView={handleView} />
}
