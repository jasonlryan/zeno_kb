/**
 * ZENO KB - Utils
 *
 * General utility functions for the app, including className helpers (e.g., cn).
 * Used throughout UI components for class name composition and other helpers.
 *
 * Essential for DRY utility logic in Zeno Knowledge Base.
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
