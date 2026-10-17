import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { CategoryListPage } from '../pages/categories/CategoryListPage';
import { BrandListPage } from '../pages/brands/BrandListPage';
import { OrderListPage } from '../pages/orders/OrderListPage';
import { UserListPage } from '../pages/users/UserListPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="categories" element={<CategoryListPage />} />
        <Route path="brands" element={<BrandListPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
