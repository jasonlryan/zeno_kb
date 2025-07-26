import type React from "react"
import { ZenoAsset } from "./config"

// Type alias for backward compatibility
export type Tool = ZenoAsset;

// Keep the original Tool interface for reference, but it's now deprecated
export interface DeprecatedTool {
  id: string
  title: string
  description: string
  type: "GPT" | "Doc" | "Script" | "Video" | "Platform" | "Tool" | "Learning Guide"
  tier: "Foundation" | "Specialist"
  complexity: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  featured?: boolean
  function: string
  link: string
  date_added: string
  added_by: string
  scheduled_feature_date?: string | null
  // Learning Guide specific fields
  content_type?: string
  estimated_read_time?: string
  prerequisites?: string[]
  learning_objectives?: string[]
  // Video specific fields
  duration?: string
  transcript_available?: boolean
  // Script specific fields
  language?: string
  requirements?: string[]
  [key: string]: any // Allow additional dynamic fields
}

// Re-export ZenoAsset for direct usage
export type { ZenoAsset } from "./config"

export interface Category {
  id: string
  icon: string
  title: string
  description: string
  count: number
  color?: string
  featured?: boolean
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
  icon: React.ComponentType<{ className?: string }> | string
  href?: string
  route?: string
  description?: string
  permissions?: string[]
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
