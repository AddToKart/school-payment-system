// src/component/AdminDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  return (
    <div>
      <h2>Welcome to the Admin Dashboard</h2>
      <p>This is a placeholder for the admin dashboard content.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
