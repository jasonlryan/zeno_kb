"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("standard");
  const [sortOrder, setSortOrder] = useState<'newest' | 'alphabetical'>('newest');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    if (!newEmail) return;
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, role: newRole }),
    });
    setNewEmail("");
    setNewRole("standard");
    fetchUsers();
  };

  const updateRole = async (email: string, role: string) => {
    await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    fetchUsers();
  };

  const deleteUser = async (id: string, email: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;
    await fetch(`/api/users?id=${id}&email=${email}`, { method: "DELETE" });
    fetchUsers();
  };

  const sortedUsers = [...users];
  if (sortOrder === 'alphabetical') {
    sortedUsers.sort((a, b) => a.email.localeCompare(b.email));
  } else {
    sortedUsers.reverse(); // newest first (assuming API returns oldest first)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="standard">Standard</option>
        </select>
        <button
          onClick={addUser}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Add
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-2">A new user is added with the default password.</p>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="sortOrder" className="text-sm">Sort by:</label>
        <select
          id="sortOrder"
          className="border rounded px-2 py-1"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'newest' | 'alphabetical')}
        >
          <option value="newest">Newest</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {u.email}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <select
                    className="border rounded px-2 py-1"
                    value={u.role}
                    onChange={(e) => updateRole(u.email, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="standard">Standard</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => deleteUser(u.id, u.email)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
