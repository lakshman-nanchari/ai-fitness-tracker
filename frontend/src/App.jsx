import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import OTPLogin from './pages/OTPLogin';
import VerifyOTP from './pages/VerifyOTP';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<OTPLogin />} />
        <Route path="/verify" element={<VerifyOTP />} />
      </Routes>
    </div>
  );
}

export default App;
