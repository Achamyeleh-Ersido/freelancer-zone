"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Ticket, TicketMessage, UpdateTicketData } from "@/lib/types"

interface TicketDetailsProps {
  ticket: Ticket
  currentUser: any | null
  onUpdate: (ticket: Ticket) => void
}

export function TicketDetails({ ticket, currentUser, onUpdate }: TicketDetailsProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Load ticket messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticket.id}/messages`)
        if (response.ok) {
          const messagesData = await response.json()
          setMessages(messagesData)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
      }
    }

    loadMessages()
  }, [ticket.id])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          message: newMessage.trim(),
          isInternal: false,
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (newStatus: Ticket["status"]) => {
    if (!currentUser || currentUser.role === "client") return

    setIsUpdating(true)
    try {
      const updateData: UpdateTicketData = { status: newStatus }
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedTicket = await response.json()
        onUpdate(updatedTicket)
      }
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: Ticket["status"]) => {
    const variants = {
      open: "default",
      "in-progress": "secondary",
      resolved: "outline",
      closed: "destructive",
    } as const

    const labels = {
      open: "Open",
      "in-progress": "In Progress",
      resolved: "Resolved",
      closed: "Closed",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive",
    } as const

    return <Badge variant={variants[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-balance">{ticket.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>#{ticket.id.slice(-8)}</span>
              <span>•</span>
              <span>Created {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Category:</span>
            <div className="font-medium capitalize">{ticket.category}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Priority:</span>
            <div className="font-medium capitalize">{ticket.priority}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div className="font-medium capitalize">{ticket.status.replace("-", " ")}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Last Updated:</span>
            <div className="font-medium">{format(new Date(ticket.updatedAt), "MMM d, yyyy")}</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Ticket Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Status Update (Admin/Staff only) */}
      {currentUser?.role !== "client" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Status</CardTitle>
            <CardDescription>Change the ticket status to track progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={ticket.status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              {isUpdating && <span className="text-sm text-muted-foreground">Updating...</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      {message.userId === currentUser?.id ? (
                        <span className="font-medium">You</span>
                      ) : (
                        <span className="font-medium">Support</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{message.userId === currentUser?.id ? "You" : "Support"}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <div className="text-sm bg-muted/50 rounded-lg p-3">
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* New Message Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-20"
            />
            <div className="flex justify-end">
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting} size="sm">
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
