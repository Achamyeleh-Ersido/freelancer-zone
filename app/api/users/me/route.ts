import { NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

// GET /api/users/me - Get current user
export async function GET() {
  try {
    const user = await dataService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
