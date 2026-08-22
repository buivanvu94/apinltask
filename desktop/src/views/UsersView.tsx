import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  CreateUserInput,
  UpdateUserInput,
} from '../services/users-service';
import { UsersTableRow } from '../components/users/users-table-row';
import { UserCreateEditModal } from '../components/users/user-create-edit-modal';
import { UserResetPasswordModal } from '../components/users/user-reset-password-modal';
import { UserDeleteModal } from '../components/users/user-delete-modal';
import { Skeleton } from '../components/common/SkeletonLoader';

export function UsersView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (input: CreateUserInput) => {
    await createUser(input);
    await fetchUsers();
  };

  const handleUpdate = async (id: string, input: UpdateUserInput) => {
    await updateUser(id, input);
    await fetchUsers();
  };

  const handleResetPassword = async (id: string, newPass: string) => {
    await resetUserPassword(id, newPass);
  };

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    setDeletingUser(null);
    await fetchUsers();
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="view-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ font: "700 26px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '4px' }}>
            Quản lý thành viên
          </div>
          <div style={{ font: '500 13.5px sans-serif', color: '#64748B' }}>
            Tổng {users.length} tài khoản trong hệ thống
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            font: '700 13.5px sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          Thêm thành viên
        </button>
      </div>

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff',
          borderRadius: '12px',
          padding: '11px 14px',
          maxWidth: '380px',
          marginBottom: '20px',
          boxShadow: '0 1px 2px rgba(15,23,42,.04),0 10px 20px -16px rgba(15,23,42,.2)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="11" cy="11" r="7" stroke="#94A3B8" strokeWidth="2" fill="none" />
          <path d="M21 21l-4.3-4.3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          style={{ border: 'none', background: 'transparent', outline: 'none', font: '500 13.5px sans-serif', color: '#0F172A', flex: 1 }}
        />
      </div>

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'flex', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #EEF1F5', font: '700 11.5px sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          <div style={{ width: '36px', marginRight: '14px' }}>#</div>
          <div style={{ flex: '1.2' }}>Thành viên</div>
          <div style={{ width: '90px' }}>Phân quyền</div>
          <div style={{ width: '80px' }}>Ngày tạo</div>
          <div style={{ width: '80px', textAlign: 'right' }}>Thao tác</div>
        </div>

        {isLoading ? (
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height="36px" />
            <Skeleton height="36px" />
            <Skeleton height="36px" />
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <UsersTableRow
              key={u.id}
              user={u}
              currentUserId={currentUser?.id}
              onEdit={(user) => setEditingUser(user)}
              onResetPassword={(user) => setResettingUser(user)}
              onDelete={(user) => setDeletingUser(user)}
            />
          ))
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8', font: '500 13.5px sans-serif' }}>
            Không tìm thấy thành viên nào phù hợp.
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreateModal || editingUser) && (
        <UserCreateEditModal
          userToEdit={editingUser}
          onSaveCreate={handleCreate}
          onSaveUpdate={handleUpdate}
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {resettingUser && (
        <UserResetPasswordModal
          user={resettingUser}
          onConfirm={handleResetPassword}
          onClose={() => setResettingUser(null)}
        />
      )}

      {deletingUser && (
        <UserDeleteModal
          user={deletingUser}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
