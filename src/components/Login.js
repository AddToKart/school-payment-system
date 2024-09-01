// src/component/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import './Login.css'; // Import the CSS file for custom styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (email.endsWith('@icpadmin.com')) {
        navigate('/admin-dashboard');
      } else if (email.endsWith('@icons.com')) {
        navigate('/student-dashboard');
      } else {
        setError('Email domain not recognized.');
        await auth.signOut();
      }
    } catch (error) {
      setError('Failed to log in. Please check your email and password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-box shadow-lg p-4 bg-white rounded">
        <h2 className="text-center login-title">School Payment System</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="form-control login-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="form-control login-input"
            />
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
