import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "../../services/data-service"
import type { CreateTicketRequest } from "../../types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role") as any

    const tickets = await dataService.getTickets(userId || undefined, role)

    return NextResponse.json({
      success: true,
      data: tickets,
    })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tickets",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTicketRequest & { userId: string } = await request.json()

    if (!body.title || !body.description || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const ticket = await dataService.createTicket(
      {
        title: body.title,
        description: body.description,
        priority: body.priority,
        category: body.category,
      },
      body.userId,
    )

    return NextResponse.json({
      success: true,
      data: ticket,
      message: "Ticket created successfully",
    })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create ticket",
      },
      { status: 500 },
    )
  }
}
