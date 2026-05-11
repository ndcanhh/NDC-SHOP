import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="admin-wrapper d-flex min-vh-100 bg-light overflow-hidden position-relative">
      {/* NÚT TOGGLE CHO MOBILE */}
      <button 
        className="admin-mobile-toggle d-lg-none shadow-sm"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* OVERLAY KHI MỞ SIDEBAR TRÊN MOBILE */}
      {isSidebarOpen && (
        <div className="admin-overlay d-lg-none" onClick={closeSidebar}></div>
      )}

      {/* SIDEBAR DỌC */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* CONTENT BÊN PHẢI */}
      <div className="admin-content-area flex-grow-1 d-flex flex-column overflow-auto">
        <main className="p-2 p-md-4 flex-grow-1">
          <div className="container-fluid px-1 px-md-3">
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
