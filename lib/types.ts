export interface User {
  id: string
  email: string
  name: string
  role: "client" | "freelancer" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: "technical" | "billing" | "general" | "project"
  clientId: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  message: string
  isInternal: boolean
  createdAt: Date
}

export interface CreateTicketData {
  title: string
  description: string
  priority: Ticket["priority"]
  category: Ticket["category"]
  clientId: string
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: Ticket["status"]
  priority?: Ticket["priority"]
  category?: Ticket["category"]
  assignedTo?: string
}
