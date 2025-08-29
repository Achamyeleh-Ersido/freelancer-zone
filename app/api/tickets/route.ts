import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"
import type { CreateTicketData } from "@/lib/types"

// GET /api/tickets - Get all tickets
export async function GET() {
  try {
    const tickets = await dataService.getTickets()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { title, description, priority, category, clientId } = body
    if (!title || !description || !priority || !category || !clientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ticketData: CreateTicketData = {
      title,
      description,
      priority,
      category,
      clientId,
    }

    const ticket = await dataService.createTicket(ticketData)
    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}
