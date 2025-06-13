import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function OTPLogin() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('api/users/request-otp/', { email }); // ✅ fixed path
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/verify', { state: { email } });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.email?.[0] || 'Failed to send OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Login - Request OTP</h2>
      <form onSubmit={handleRequestOTP} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-yellow-500 transition">
          Send OTP
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}
