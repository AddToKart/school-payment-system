// src/component/StudentDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  return (
    <div>
      <h2>Welcome to the Student Dashboard</h2>
      <p>This is a placeholder for the student dashboard content.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StudentDashboard;
