// src/component/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const PrivateRoute = ({ children, role }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isAdmin = user.email.endsWith('@icpadmin.com');
  const isStudent = user.email.endsWith('@icons.com');

  if (role === 'admin' && isAdmin) {
    return children;
  } else if (role === 'student' && isStudent) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
