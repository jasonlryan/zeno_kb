"use client";

import { useState, useCallback } from "react";
import type { Tool, AccessRequest } from "../types";

// Mock user permissions - in real app this would come from auth/backend
const mockUserPermissions = {
  userId: "current-user",
  approvedTools: ["1", "2"], // Tool IDs user has access to
  role: "standard", // "standard" | "specialist" | "admin"
};

export function useAccessControl() {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has access to a specific tool
  const hasAccess = useCallback((tool: Tool): boolean => {
    // Foundation tools are always accessible
    if (tool.tier === "Foundation") {
      return true;
    }

    // Specialist tools require approval
    if (tool.tier === "Specialist") {
      return mockUserPermissions.approvedTools.includes(tool.id);
    }

    return false;
  }, []);

  // Check if user can request access to a tool
  const canRequestAccess = useCallback((tool: Tool): boolean => {
    // Can't request access to Foundation tools (already have access)
    if (tool.tier === "Foundation") {
      return false;
    }

    // Can't request access if already approved
    if (hasAccess(tool)) {
      return false;
    }

    // Can't request access if already pending
    const existingRequest = accessRequests.find(
      (req) => req.toolId === tool.id && req.status === "pending"
    );

    return !existingRequest;
  }, [accessRequests, hasAccess]);

  // Submit access request
  const requestAccess = useCallback(
    async (request: Omit<AccessRequest, "id">): Promise<void> => {
      setIsLoading(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newRequest: AccessRequest = {
          ...request,
          id: Date.now().toString(),
        };

        setAccessRequests((prev) => [...prev, newRequest]);

        // Simulate notification
        console.log("Access request submitted:", newRequest);
      } catch (error) {
        console.error("Error submitting access request:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get access status for a tool
  const getAccessStatus = useCallback(
    (tool: Tool) => {
      if (hasAccess(tool)) {
        return {
          status: "granted" as const,
          message: "You have access to this tool",
          canUse: true,
        };
      }

      if (tool.tier === "Foundation") {
        return {
          status: "granted" as const,
          message: "Foundation tools are available to all users",
          canUse: true,
        };
      }

      const pendingRequest = accessRequests.find(
        (req) => req.toolId === tool.id && req.status === "pending"
      );

      if (pendingRequest) {
        return {
          status: "pending" as const,
          message: "Access request is pending approval",
          canUse: false,
        };
      }

      const deniedRequest = accessRequests.find(
        (req) => req.toolId === tool.id && req.status === "denied"
      );

      if (deniedRequest) {
        return {
          status: "denied" as const,
          message: "Access request was denied",
          canUse: false,
        };
      }

      return {
        status: "not_requested" as const,
        message: "Specialist access required",
        canUse: false,
      };
    },
    [accessRequests, hasAccess]
  );

  // Get all access requests for current user
  const getUserAccessRequests = useCallback((): AccessRequest[] => {
    return accessRequests.filter(
      (req) => req.userId === mockUserPermissions.userId
    );
  }, [accessRequests]);

  return {
    hasAccess,
    canRequestAccess,
    requestAccess,
    getAccessStatus,
    getUserAccessRequests,
    isLoading,
  };
} 