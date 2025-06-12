import React, { useState } from 'react';
import API from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await API.post('/api/register/', form);
      setMessage(res.data.message);
      setForm({ email: '', username: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.email?.[0] || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-yellow-500 transition">Register</button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}
