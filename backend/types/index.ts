export type TicketStatus = "open" | "in-progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"
export type TicketCategory = "technical" | "billing" | "general" | "feature-request" | "bug-report"
export type UserRole = "client" | "admin" | "support"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  userId: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  user?: User
  assignee?: User
  messages?: TicketMessage[]
  _count?: {
    messages: number
  }
}

export interface TicketMessage {
  id: string
  content: string
  ticketId: string
  userId: string
  isInternal: boolean
  createdAt: Date
  user?: User
}

export interface CreateTicketRequest {
  title: string
  description: string
  priority: TicketPriority
  category: TicketCategory
}

export interface UpdateTicketRequest {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  assignedTo?: string
}

export interface CreateMessageRequest {
  content: string
  isInternal?: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
