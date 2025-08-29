"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreateTicketData } from "@/lib/types"

const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Please select a priority level",
  }),
  category: z.enum(["technical", "billing", "general", "project"], {
    required_error: "Please select a category",
  }),
})

type TicketFormData = z.infer<typeof ticketSchema>

interface TicketFormProps {
  onSuccess?: (ticket: any) => void
  onError?: (error: string) => void
}

export function TicketForm({ onSuccess, onError }: TicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "general",
    },
  })

  // Get current user on component mount
  useState(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((user) => setCurrentUser(user))
      .catch(() => {
        // Mock user if API fails
        setCurrentUser({
          id: "user-1",
          email: "client@example.com",
          name: "John Doe",
          role: "client",
        })
      })
  })

  const onSubmit = async (data: TicketFormData) => {
    if (!currentUser) {
      onError?.("User not authenticated")
      return
    }

    setIsSubmitting(true)

    try {
      const ticketData: CreateTicketData = {
        ...data,
        clientId: currentUser.id,
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create ticket")
      }

      const ticket = await response.json()
      form.reset()
      onSuccess?.(ticket)
    } catch (error) {
      console.error("Error creating ticket:", error)
      onError?.(error instanceof Error ? error.message : "Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Support Ticket</CardTitle>
        <CardDescription>Describe your issue and we'll get back to you as soon as possible.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your issue" {...field} />
                  </FormControl>
                  <FormDescription>Provide a clear, concise title for your support request.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="general">General Support</SelectItem>
                        <SelectItem value="project">Project Related</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, or relevant context..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The more details you provide, the faster we can help resolve your issue.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
