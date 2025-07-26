import React, { useState } from "react";
import { Button } from "./ui/button";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserDeleteModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
      setConfirmText("");
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  if (!isOpen || !user) return null;

  const isConfirmValid = confirmText === user.email;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg zeno-content-padding w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
            Delete User
          </h2>
          <button
            onClick={handleClose}
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

        <div className="mb-6">
          <div className="flex items-center mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <svg
              className="w-6 h-6 text-red-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                This action cannot be undone
              </p>
              <p className="text-xs text-red-600 dark:text-red-300">
                The user will be permanently deleted from the system
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-foreground dark:text-gray-300 mb-2">
              You are about to delete:
            </p>
            <div className="bg-muted dark:bg-gray-700 p-3 rounded-lg">
              <p className="font-medium text-foreground dark:text-white">
                {user.email}
              </p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Role: {user.role}
              </p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Created: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              Type the user's email to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={user.email}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !isConfirmValid}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </div>
    </div>
  );
};
