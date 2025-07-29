import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const googleLogin = async (credential) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, { token: credential });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password });
  };

  const verifyOtp = async (email, otp) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, { email, otp });
  };

  const forgotPassword = async (email) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
  };

  const resetPassword = async (email, otp, newPassword) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { email, otp, newPassword });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, verifyOtp, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};