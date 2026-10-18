import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchUsersAsync,
  updateUserAsync,
  deleteUserAsync,
} from '../../features/users/userSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import {
  Search,
  Shield,
  User as UserIcon,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const UserListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: users, status, error } = useAppSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsersAsync(undefined));
  }, [dispatch]);

  const handleToggleStatus = async (user: (typeof users)[0]) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    setActionLoadingId(user.id);
    try {
      await dispatch(
        updateUserAsync({
          id: user.id,
          input: { status: nextStatus },
        })
      ).unwrap();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (user: (typeof users)[0]) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmChange = window.confirm(
      `Bạn có chắc muốn đổi vai trò của ${user.email} thành ${nextRole.toUpperCase()}?`
    );
    if (!confirmChange) return;

    setActionLoadingId(user.id);
    try {
      await dispatch(
        updateUserAsync({
          id: user.id,
          input: { role: nextRole },
        })
      ).unwrap();
    } catch (err) {
      console.error('Lỗi khi đổi quyền:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa tài khoản ${email}?`
    );
    if (!confirmDelete) return;

    setActionLoadingId(id);
    try {
      await dispatch(deleteUserAsync(id)).unwrap();
    } catch (err) {
      console.error('Lỗi khi xóa tài khoản:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.firstName && u.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="title-xl">
            Quản lý <span className="text-gradient">Người dùng</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Dữ liệu trực tiếp từ User Service Database (MySQL)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch(fetchUsersAsync(undefined))}
          isLoading={status === 'loading'}
          icon={<RefreshCw size={14} />}
        >
          Làm mới
        </Button>
      </div>

      {/* Error alert if any */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-danger)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
          }}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter */}
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Tìm theo email hoặc họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />

          <Select
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'admin', label: 'Quản trị viên (Admin)' },
              { value: 'manager', label: 'Quản lý (Manager)' },
              { value: 'user', label: 'Khách hàng (User)' },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />

          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Tổng số: <strong style={{ color: 'var(--text-primary)' }}>{filteredUsers.length}</strong> người dùng
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {status === 'loading' && users.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <Spinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <UserIcon size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div>Không tìm thấy người dùng nào phù hợp</div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày đăng ký</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isCurrentActionLoading = actionLoadingId === u.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-muted)',
                              border: '1px solid var(--border-primary)',
                            }}
                          >
                            {u.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.email}</div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              ID: {u.id.slice(0, 13)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {u.lastName || u.firstName ? `${u.lastName || ''} ${u.firstName || ''}` : '-'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.phone || '-'}</td>
                      <td>
                        <Badge variant={u.role === 'admin' ? 'info' : u.role === 'manager' ? 'warning' : 'neutral'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                          {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {/* Toggle Status */}
                          <Button
                            variant={u.status === 'active' ? 'ghost' : 'secondary'}
                            size="sm"
                            title={u.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                            disabled={isCurrentActionLoading}
                            onClick={() => handleToggleStatus(u)}
                            icon={u.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                          >
                            {u.status === 'active' ? 'Khóa' : 'Mở'}
                          </Button>

                          {/* Toggle Role */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Đổi quyền Admin / User"
                            disabled={isCurrentActionLoading}
                            onClick={() => handleToggleRole(u)}
                            icon={<Shield size={14} />}
                          >
                            {u.role === 'admin' ? 'Hạ quyền' : 'Lên Admin'}
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa người dùng"
                            disabled={isCurrentActionLoading}
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            icon={<Trash2 size={14} color="var(--accent-danger)" />}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
