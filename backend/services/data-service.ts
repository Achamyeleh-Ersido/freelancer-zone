import type {
  User,
  Ticket,
  TicketMessage,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateMessageRequest,
  UserRole,
} from "../types"

class DataService {
  private getStorageKey(key: string): string {
    return `freelance_tickets_${key}`
  }

  // User operations
  async getUsers(): Promise<User[]> {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem(this.getStorageKey("users"))
    return users ? JSON.parse(users) : []
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find((user) => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find((user) => user.email === email) || null
  }

  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const users = await this.getUsers()
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    users.push(newUser)
    localStorage.setItem(this.getStorageKey("users"), JSON.stringify(users))
    return newUser
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers()
    const userIndex = users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date() }
    localStorage.setItem(this.getStorageKey("users"), JSON.stringify(users))
    return users[userIndex]
  }

  // Ticket operations
  async getTickets(userId?: string, role?: UserRole): Promise<Ticket[]> {
    if (typeof window === "undefined") return []
    const tickets = localStorage.getItem(this.getStorageKey("tickets"))
    let allTickets: Ticket[] = tickets ? JSON.parse(tickets) : []

    // Filter tickets based on user role
    if (userId && role === "client") {
      allTickets = allTickets.filter((ticket) => ticket.userId === userId)
    }

    // Add user information to tickets
    const users = await this.getUsers()
    return allTickets.map((ticket) => ({
      ...ticket,
      user: users.find((user) => user.id === ticket.userId),
      assignee: ticket.assignedTo ? users.find((user) => user.id === ticket.assignedTo) : undefined,
    }))
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const tickets = await this.getTickets()
    return tickets.find((ticket) => ticket.id === id) || null
  }

  async createTicket(ticketData: CreateTicketRequest, userId: string): Promise<Ticket> {
    const tickets = await this.getTickets()
    const newTicket: Ticket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "open",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    tickets.push(newTicket)
    localStorage.setItem(this.getStorageKey("tickets"), JSON.stringify(tickets))
    return newTicket
  }

  async updateTicket(id: string, updates: UpdateTicketRequest): Promise<Ticket | null> {
    if (typeof window === "undefined") return null
    const tickets = localStorage.getItem(this.getStorageKey("tickets"))
    const allTickets: Ticket[] = tickets ? JSON.parse(tickets) : []

    const ticketIndex = allTickets.findIndex((ticket) => ticket.id === id)
    if (ticketIndex === -1) return null

    allTickets[ticketIndex] = { ...allTickets[ticketIndex], ...updates, updatedAt: new Date() }
    localStorage.setItem(this.getStorageKey("tickets"), JSON.stringify(allTickets))
    return allTickets[ticketIndex]
  }

  async deleteTicket(id: string): Promise<boolean> {
    if (typeof window === "undefined") return false
    const tickets = localStorage.getItem(this.getStorageKey("tickets"))
    const allTickets: Ticket[] = tickets ? JSON.parse(tickets) : []

    const filteredTickets = allTickets.filter((ticket) => ticket.id !== id)
    if (filteredTickets.length === allTickets.length) return false

    localStorage.setItem(this.getStorageKey("tickets"), JSON.stringify(filteredTickets))
    return true
  }

  // Message operations
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    if (typeof window === "undefined") return []
    const messages = localStorage.getItem(this.getStorageKey("messages"))
    const allMessages: TicketMessage[] = messages ? JSON.parse(messages) : []

    const ticketMessages = allMessages.filter((message) => message.ticketId === ticketId)
    const users = await this.getUsers()

    return ticketMessages.map((message) => ({
      ...message,
      user: users.find((user) => user.id === message.userId),
    }))
  }

  async createMessage(ticketId: string, messageData: CreateMessageRequest, userId: string): Promise<TicketMessage> {
    if (typeof window === "undefined") throw new Error("Cannot create message on server side")

    const messages = localStorage.getItem(this.getStorageKey("messages"))
    const allMessages: TicketMessage[] = messages ? JSON.parse(messages) : []

    const newMessage: TicketMessage = {
      ...messageData,
      id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      userId,
      isInternal: messageData.isInternal || false,
      createdAt: new Date(),
    }

    allMessages.push(newMessage)
    localStorage.setItem(this.getStorageKey("messages"), JSON.stringify(allMessages))
    return newMessage
  }

  // Authentication helpers
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const users = await this.getUsers()
    // In a real app, you'd hash and compare passwords
    const user = users.find((u) => u.email === email)
    return user || null
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === "undefined") return null
    const currentUserId = localStorage.getItem(this.getStorageKey("currentUser"))
    if (!currentUserId) return null
    return this.getUserById(currentUserId)
  }

  async setCurrentUser(userId: string): Promise<void> {
    if (typeof window === "undefined") return
    localStorage.setItem(this.getStorageKey("currentUser"), userId)
  }

  async clearCurrentUser(): Promise<void> {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.getStorageKey("currentUser"))
  }
}

export const dataService = new DataService()
