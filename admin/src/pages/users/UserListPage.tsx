import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUsersAsync } from '../../features/users/userSlice';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { Search, Shield, User, RefreshCw } from 'lucide-react';

export const UserListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: users, status } = useAppSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    dispatch(fetchUsersAsync(undefined));
  }, [dispatch]);

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
            Kết nối User Service qua API Gateway (Port 3004)
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
              { value: 'manager', label: 'Quản lý kho (Manager)' },
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
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
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
                        {u.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.email}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          ID: {u.id}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
