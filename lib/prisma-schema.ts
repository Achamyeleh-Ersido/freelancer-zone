// This file shows what the Prisma schema would look like when migrating to PostgreSQL

export const PRISMA_SCHEMA = `
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  tickets         Ticket[]        @relation("ClientTickets")
  assignedTickets Ticket[]        @relation("AssignedTickets")
  messages        TicketMessage[]

  @@map("users")
}

model Ticket {
  id          String       @id @default(cuid())
  title       String
  description String
  status      TicketStatus @default(OPEN)
  priority    Priority     @default(MEDIUM)
  category    Category     @default(GENERAL)
  clientId    String
  assignedTo  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  resolvedAt  DateTime?

  // Relations
  client   User            @relation("ClientTickets", fields: [clientId], references: [id])
  assignee User?           @relation("AssignedTickets", fields: [assignedTo], references: [id])
  messages TicketMessage[]

  @@map("tickets")
}

model TicketMessage {
  id         String   @id @default(cuid())
  ticketId   String
  userId     String
  message    String
  isInternal Boolean  @default(false)
  createdAt  DateTime @default(now())

  // Relations
  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id])

  @@map("ticket_messages")
}

enum Role {
  CLIENT
  FREELANCER
  ADMIN
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum Category {
  TECHNICAL
  BILLING
  GENERAL
  PROJECT
}
`
