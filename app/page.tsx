"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TicketForm } from "@/components/ticket-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Ticket, Users, Clock, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleTicketSuccess = (ticket: any) => {
    setNotification({
      type: "success",
      message: `Ticket #${ticket.id.slice(-8)} created successfully! We'll get back to you soon.`,
    })
    setShowForm(false)
    setTimeout(() => setNotification(null), 5000)
  }

  const handleTicketError = (error: string) => {
    setNotification({
      type: "error",
      message: error,
    })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleGetStarted = () => {
    if (user) {
      router.push("/tickets")
    } else {
      router.push("/auth")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4">Freelance Support Center</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Get professional support for all your freelancing needs. Submit tickets, track progress, and get expert
            help.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className="max-w-2xl mx-auto mb-6">
            <Card
              className={`border-l-4 ${
                notification.type === "success"
                  ? "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-l-red-500 bg-red-50 dark:bg-red-950/20"
              }`}
            >
              <CardContent className="flex items-center gap-3 pt-4">
                {notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p
                  className={`text-sm ${
                    notification.type === "success"
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {!showForm ? (
          <div className="space-y-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Quick Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit tickets and get fast responses from our expert team.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Expert Team</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional freelancers and support specialists ready to help.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">24/7 Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Round-the-clock support for urgent issues and questions.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Quality Service</h3>
                  <p className="text-sm text-muted-foreground">
                    High-quality solutions tailored to your specific needs.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <CardTitle>{user ? `Welcome back, ${user.name}!` : "Need Help?"}</CardTitle>
                <CardDescription>
                  {user
                    ? "Access your tickets and get support from our expert team."
                    : "Submit a support ticket and our team will assist you promptly."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleGetStarted} size="lg">
                    {user ? "View My Tickets" : "Get Started"}
                  </Button>
                  {user && (
                    <Button onClick={() => setShowForm(true)} variant="outline" size="lg">
                      Create New Ticket
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <Button variant="outline" onClick={() => setShowForm(false)} className="mb-6">
                ← Back to Home
              </Button>
            </div>

            <TicketForm onSuccess={handleTicketSuccess} onError={handleTicketError} />
          </div>
        )}
      </div>
    </div>
  )
}
