import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

// GET /api/tickets/[id]/messages - Get messages for a ticket
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // First check if ticket exists
    const ticket = await dataService.getTicketById(params.id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const messages = await dataService.getTicketMessages(params.id)
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching ticket messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST /api/tickets/[id]/messages - Add a message to a ticket
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate required fields
    const { userId, message, isInternal = false } = body
    if (!userId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if ticket exists
    const ticket = await dataService.getTicketById(params.id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const newMessage = await dataService.addTicketMessage(params.id, userId, message, isInternal)

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Error adding ticket message:", error)
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
  }
}
