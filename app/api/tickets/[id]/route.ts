import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"
import type { UpdateTicketData } from "@/lib/types"

// GET /api/tickets/[id] - Get a specific ticket
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await dataService.getTicketById(params.id)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
  }
}

// PUT /api/tickets/[id] - Update a ticket
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: UpdateTicketData = {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      category: body.category,
      assignedTo: body.assignedTo,
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateTicketData] === undefined) {
        delete updateData[key as keyof UpdateTicketData]
      }
    })

    const ticket = await dataService.updateTicket(params.id, updateData)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
  }
}

// DELETE /api/tickets/[id] - Delete a ticket
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await dataService.deleteTicket(params.id)

    if (!success) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ticket deleted successfully" })
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 })
  }
}
