import React, { useState } from 'react';
import API from '../api/axios';
import { useLocation } from 'react-router-dom';

export default function VerifyOTP() {
  const { state } = useLocation();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('api/users/verify-otp/', { email: state?.email, code }); // ✅ fixed path
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.code?.[0] || 'Invalid OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-yellow-500 transition">
          Verify
        </button>
      </form>
      {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
    </div>
  );
}
