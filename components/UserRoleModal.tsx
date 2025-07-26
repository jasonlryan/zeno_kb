import React, { useState } from "react";
import { Button } from "./ui/button";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserRoleModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, email: string, newRole: string) => Promise<void>;
}

const AVAILABLE_ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to all features",
  },
  { value: "standard", label: "Standard", description: "Standard user access" },
  {
    value: "curator",
    label: "Curator",
    description: "Can manage content and assets",
  },
];

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "standard");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await onSave(user.id, user.email, selectedRole);
      onClose();
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg zeno-content-padding w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">
            Edit User Role
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-muted-foreground dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
            User: <span className="font-medium">{user.email}</span>
          </p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            Created: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-3">
            Select Role
          </label>
          <div className="space-y-3">
            {AVAILABLE_ROLES.map((role) => (
              <label
                key={role.value}
                className="flex items-start space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-foreground dark:text-white">
                    {role.label}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    {role.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedRole === user.role}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};
