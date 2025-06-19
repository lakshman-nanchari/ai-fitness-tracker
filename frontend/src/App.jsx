import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import LoginSuccess from './pages/LoginSuccess';
import UserProfile from './pages/UserProfile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login-success" element={<LoginSuccess />} /> 
        <Route path="/profile" element={<UserProfile />} />

      </Routes>

      {/* ✅ Toast Container to show success/error messages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        draggable
        theme="colored" // or 'dark', 'light'
      />
    </div>
  );
}

export default App;
