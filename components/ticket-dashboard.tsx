"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Eye, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Ticket, User } from "@/lib/types"
import { TicketDetails } from "./ticket-details"

interface TicketDashboardProps {
  onCreateTicket?: () => void
}

export function TicketDashboard({ onCreateTicket }: TicketDashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Load tickets and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketsRes, userRes] = await Promise.all([fetch("/api/tickets"), fetch("/api/users/me")])

        const ticketsData = await ticketsRes.json()
        const userData = await userRes.json()

        setTickets(ticketsData)
        setCurrentUser(userData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = tickets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter)
    }

    // Filter by user role (clients only see their tickets)
    if (currentUser?.role === "client") {
      filtered = filtered.filter((ticket) => ticket.clientId === currentUser.id)
    }

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, statusFilter, priorityFilter, currentUser])

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

  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)))
    setSelectedTicket(updatedTicket)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === "client" ? "Manage your support requests" : "Manage all support tickets"}
          </p>
        </div>
        {onCreateTicket && (
          <Button onClick={onCreateTicket}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredTickets.length}</div>
            <p className="text-xs text-muted-foreground">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredTickets.filter((t) => t.status === "open").length}</div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredTickets.filter((t) => t.status === "in-progress").length}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredTickets.filter((t) => t.status === "resolved").length}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tickets found matching your criteria.</p>
              {onCreateTicket && (
                <Button onClick={onCreateTicket} className="mt-4">
                  Create Your First Ticket
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">#{ticket.id.slice(-8)}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate font-medium">{ticket.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{ticket.description.slice(0, 60)}...</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell className="capitalize">{ticket.category}</TableCell>
                    <TableCell className="text-sm">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Ticket Details</DialogTitle>
                            <DialogDescription>View and manage ticket #{ticket.id.slice(-8)}</DialogDescription>
                          </DialogHeader>
                          {selectedTicket && (
                            <TicketDetails
                              ticket={selectedTicket}
                              currentUser={currentUser}
                              onUpdate={handleTicketUpdate}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
