import type React from "react"
export interface Tool {
  id: string
  title: string
  description: string
  type: "GPT" | "Doc" | "Script" | "Video"
  tier: "Foundation" | "Specialist"
  complexity: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  featured?: boolean
  function: string
  link: string
  date_added: string
  added_by: string
  scheduled_feature_date?: string
}

export interface Category {
  id: string
  icon: string
  title: string
  description: string
  count: number
}

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export interface SidebarItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  active?: boolean
}

export interface SidebarSection {
  id: string
  title: string
  items: SidebarItem[]
}

export interface FilterState {
  function: string
  tier: string
  newness: string
}

export interface ToastMessage {
  id: string
  text: string
  type: "success" | "error" | "info"
  duration?: number
}

export interface AccessRequest {
  id: string
  toolId: string
  userId: string
  requestDate: string
  status: "pending" | "approved" | "denied"
}

export interface Feedback {
  id: string
  toolId: string
  userId: string
  helpful: boolean
  comment?: string
  date: string
}
