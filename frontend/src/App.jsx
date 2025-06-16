import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} /> {/* ✅ Added properly */}
      </Routes>
    </div>
  );
}

export default App;
