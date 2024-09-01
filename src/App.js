// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './routes/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

const authUser = {
  name: 'John Doe', // Replace with the actual user's name
  profilePicture: 'path-to-profile-picture.jpg' // Replace with the actual profile picture path or URL
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard authUser={authUser} onLogout={() => {/* handle logout */}} />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
