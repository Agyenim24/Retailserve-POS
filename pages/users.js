import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import { UserPlusIcon, PencilSquareIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import UserModal from '../components/UserModal';

export default function Users() {
  // --- SESSION & STATE ---
  // Requires NextAuth session to verify who is attempting to modify users
  const { data: session } = useSession();
  
  // Array of all authenticated users allowed to access this POS
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal visibility switch
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Which user is currently being edited
  const [editingUser, setEditingUser] = useState(null);

  // --- API COMMUNICATION ---
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      // Regardless of failure or success, stop the loading state
      setLoading(false);
    }
  };

  // Triggered when submitting the user Add/Edit Modal Form
  const handleSave = async (formData) => {
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const endpoint = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');

      toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Role-Based Access Control logic for deleting
  const handleDelete = async (user) => {
    // Hard-coded protection rule: Managers cannot strip permissions from the business owner (ADMIN)
    if (user.role === 'ADMIN' && session.user.role === 'MANAGER') {
      toast.error('Managers cannot delete Admin users.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('User deleted');
          fetchUsers();
        } else {
          const err = await res.json();
          toast.error(err.error);
        }
      } catch (e) {
        toast.error('Error deleting user');
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <Layout title="Users">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">User Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system access and roles</p>
          </div>
          {session?.user?.role === 'ADMIN' && (
            <button 
              onClick={openAddModal}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              Add User
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated text-xs uppercase text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Added On</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:text-slate-400'
                      }`}>
                        {user.role === 'ADMIN' && <ShieldCheckIcon className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Manager can only edit/delete non-admins */}
                        {(session.user.role === 'ADMIN' || user.role !== 'ADMIN') && (
                          <>
                            <button 
                              onClick={() => openEditModal(user)}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-all"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(user)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {session.user.role === 'MANAGER' && user.role === 'ADMIN' && (
                          <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase italic">Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <UserModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          user={editingUser}
          sessionUserRole={session?.user?.role}
        />
      </Layout>
    </ProtectedRoute>
  );
}
