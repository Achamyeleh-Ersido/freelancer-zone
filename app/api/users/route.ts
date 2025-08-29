import { NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

// GET /api/users - Get all users (for admin/assignment purposes)
export async function GET() {
  try {
    const users = await dataService.getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
