import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';
import { useAppSelector } from '../../app/hooks';

export const AdminLayout: React.FC = () => {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <div className="layout-container">
      <Sidebar />
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
