"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"
import { useAuth } from "@/frontend/lib/auth-context"
import type { TicketPriority, TicketCategory } from "@/backend/types"

const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["technical", "billing", "general", "feature-request", "bug-report"]),
})

type TicketFormData = z.infer<typeof ticketSchema>

interface TicketFormProps {
  onSuccess?: (ticket: any) => void
  onError?: (error: string) => void
}

export function TicketForm({ onSuccess, onError }: TicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "general",
    },
  })

  const onSubmit = async (data: TicketFormData) => {
    if (!user) {
      onError?.("You must be logged in to submit a ticket")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        form.reset()
        onSuccess?.(result.data)
      } else {
        onError?.(result.error || "Failed to create ticket")
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      onError?.("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const priorityOptions: { value: TicketPriority; label: string; description: string }[] = [
    { value: "low", label: "Low", description: "General questions, minor issues" },
    { value: "medium", label: "Medium", description: "Standard support requests" },
    { value: "high", label: "High", description: "Important issues affecting work" },
    { value: "urgent", label: "Urgent", description: "Critical issues requiring immediate attention" },
  ]

  const categoryOptions: { value: TicketCategory; label: string }[] = [
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "general", label: "General Inquiry" },
    { value: "feature-request", label: "Feature Request" },
    { value: "bug-report", label: "Bug Report" },
  ]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Support Ticket</CardTitle>
        <CardDescription>
          Describe your issue or question and our support team will get back to you promptly.
        </CardDescription>
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
                  <FormDescription>Provide a clear, concise title for your support request</FormDescription>
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
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
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
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The more details you provide, the better we can assist you</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
