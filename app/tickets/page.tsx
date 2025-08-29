"use client"

import { useState } from "react"
import { TicketDashboard } from "@/components/ticket-dashboard"
import { TicketForm } from "@/components/ticket-form"
import { Button } from "@/components/ui/button"

export default function TicketsPage() {
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleTicketSuccess = (ticket: any) => {
    setNotification({
      type: "success",
      message: `Ticket #${ticket.id.slice(-8)} created successfully!`,
    })
    setShowForm(false)
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000)
    // Refresh the page to show new ticket
    window.location.reload()
  }

  const handleTicketError = (error: string) => {
    setNotification({
      type: "error",
      message: error,
    })
    setTimeout(() => setNotification(null), 5000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div className="mb-6">
            <div
              className={`p-4 rounded-lg border ${
                notification.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200"
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        {!showForm ? (
          <TicketDashboard onCreateTicket={() => setShowForm(true)} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Create New Ticket</h1>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Back to Dashboard
              </Button>
            </div>
            <TicketForm onSuccess={handleTicketSuccess} onError={handleTicketError} />
          </div>
        )}
      </div>
    </div>
  )
}
