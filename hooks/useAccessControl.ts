"use client";

import { useState, useCallback } from "react";
import type { Tool, AccessRequest } from "../types";
import { useSupabaseAuth } from "./useSupabaseAuth";

export function useAccessControl() {
  const { user, role, loading } = useSupabaseAuth();
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Fetch approvedTools from user profile or DB in the future
  const approvedTools: string[] = [];

  // Check if user has access to a specific tool
  const hasAccess = useCallback((tool: Tool): boolean => {
    // Foundation tools are always accessible
    if (tool.tier === "Foundation") {
      return true;
    }

    // Specialist tools require approval
    if (tool.tier === "Specialist") {
      return approvedTools.includes(tool.id);
    }

    // Optionally, add admin override
    if (role === "admin") {
      return true;
    }

    return false;
  }, [approvedTools, role]);

  // Check if user can request access to a tool
  const canRequestAccess = useCallback((tool: Tool): boolean => {
    if (tool.tier === "Foundation") {
      return false;
    }
    if (hasAccess(tool)) {
      return false;
    }
    const existingRequest = accessRequests.find(
      (req) => req.toolId === tool.id && req.status === "pending" && req.userId === user?.id
    );
    return !existingRequest;
  }, [accessRequests, hasAccess, user]);

  // Submit access request
  const requestAccess = useCallback(
    async (request: Omit<AccessRequest, "id">): Promise<void> => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newRequest: AccessRequest = {
          ...request,
          id: Date.now().toString(),
        };
        setAccessRequests((prev) => [...prev, newRequest]);
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
        (req) => req.toolId === tool.id && req.status === "pending" && req.userId === user?.id
      );
      if (pendingRequest) {
        return {
          status: "pending" as const,
          message: "Access request is pending approval",
          canUse: false,
        };
      }
      const deniedRequest = accessRequests.find(
        (req) => req.toolId === tool.id && req.status === "denied" && req.userId === user?.id
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
    [accessRequests, hasAccess, user]
  );

  // Get all access requests for current user
  const getUserAccessRequests = useCallback((): AccessRequest[] => {
    if (!user) return [];
    return accessRequests.filter((req) => req.userId === user.id);
  }, [accessRequests, user]);

  return {
    hasAccess,
    canRequestAccess,
    requestAccess,
    getAccessStatus,
    getUserAccessRequests,
    isLoading: isLoading || loading,
  };
} 