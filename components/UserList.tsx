import React, { useEffect, useState } from "react";
import { UserRoleModal } from "./UserRoleModal";
import { UserDeleteModal } from "./UserDeleteModal";
import { AddUserModal } from "./AddUserModal";
import { Button } from "./ui/button";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserListProps {
  role: string | null;
}

export const UserList: React.FC<UserListProps> = ({ role }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const fetchUsers = async () => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setUsers(data.users);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleRoleSave = async (
    userId: string,
    email: string,
    newRole: string
  ) => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, email, role: newRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const handleAddUser = async (email: string, role: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add user");
      }

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  };

  const getRoleBadgeColor = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "curator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "standard":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (role !== "admin") return null;
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="zeno-heading-xl text-foreground dark:text-white">
            User Management
          </h2>
          <p className="zeno-text-sm text-muted-foreground dark:text-gray-400 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          className="zeno-button-blue"
        >
          Add User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-muted dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 zeno-nowrap text-sm text-foreground dark:text-gray-100">
                  {user.email}
                </td>
                <td className="px-6 py-4 zeno-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 zeno-nowrap text-sm text-foreground dark:text-gray-100">
                  {new Date(user.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 zeno-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(user)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit Role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserRoleModal
        user={selectedUser}
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleRoleSave}
      />

      <UserDeleteModal
        user={selectedUser}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUserDelete}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSave={handleAddUser}
      />
    </>
  );
};
