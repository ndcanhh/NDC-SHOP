import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = () => {
  return (
    <div className="admin-wrapper d-flex min-vh-100 bg-light overflow-hidden">
      {/* SIDEBAR DỌC */}
      <AdminSidebar />

      {/* CONTENT BÊN PHẢI */}
      <div className="admin-content-area flex-grow-1 d-flex flex-column overflow-auto">
        <main className="p-4 flex-grow-1">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
        
        <footer className="text-center py-3 text-muted small bg-white border-top">
          &copy; {new Date().getFullYear()} NDC SHOP
        </footer>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AdminLayout;
