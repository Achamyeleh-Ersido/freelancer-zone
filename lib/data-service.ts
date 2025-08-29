import type { Ticket, User, TicketMessage, CreateTicketData, UpdateTicketData } from "./types"

// Mock data service using localStorage (easily replaceable with Prisma later)
class DataService {
  private getFromStorage<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    const tickets = this.getFromStorage<Ticket>("tickets")
    return tickets.map((ticket) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : undefined,
    }))
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const tickets = await this.getTickets()
    return tickets.find((ticket) => ticket.id === id) || null
  }

  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const tickets = await this.getTickets()
    const newTicket: Ticket = {
      id: this.generateId(),
      ...data,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    tickets.push(newTicket)
    this.saveToStorage("tickets", tickets)
    return newTicket
  }

  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket | null> {
    const tickets = await this.getTickets()
    const ticketIndex = tickets.findIndex((ticket) => ticket.id === id)

    if (ticketIndex === -1) return null

    const updatedTicket = {
      ...tickets[ticketIndex],
      ...data,
      updatedAt: new Date(),
      resolvedAt: data.status === "resolved" ? new Date() : tickets[ticketIndex].resolvedAt,
    }

    tickets[ticketIndex] = updatedTicket
    this.saveToStorage("tickets", tickets)
    return updatedTicket
  }

  async deleteTicket(id: string): Promise<boolean> {
    const tickets = await this.getTickets()
    const filteredTickets = tickets.filter((ticket) => ticket.id !== id)

    if (filteredTickets.length === tickets.length) return false

    this.saveToStorage("tickets", filteredTickets)
    return true
  }

  // User operations (mock for now)
  async getCurrentUser(): Promise<User | null> {
    // Mock current user - in real app this would come from auth
    return {
      id: "user-1",
      email: "client@example.com",
      name: "John Doe",
      role: "client",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async getUsers(): Promise<User[]> {
    // Mock users data
    return [
      {
        id: "user-1",
        email: "client@example.com",
        name: "John Doe",
        role: "client",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }

  // Ticket messages operations
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const messages = this.getFromStorage<TicketMessage>("ticket-messages")
    return messages
      .filter((message) => message.ticketId === ticketId)
      .map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt),
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  async addTicketMessage(
    ticketId: string,
    userId: string,
    message: string,
    isInternal = false,
  ): Promise<TicketMessage> {
    const messages = this.getFromStorage<TicketMessage>("ticket-messages")
    const newMessage: TicketMessage = {
      id: this.generateId(),
      ticketId,
      userId,
      message,
      isInternal,
      createdAt: new Date(),
    }

    messages.push(newMessage)
    this.saveToStorage("ticket-messages", messages)
    return newMessage
  }
}

export const dataService = new DataService()
