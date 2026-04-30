import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminHeader />
      <main className="flex-grow-1 py-4">
        <Container fluid className="px-4">
          <Outlet />
        </Container>
      </main>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AdminLayout;
