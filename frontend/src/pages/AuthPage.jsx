import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function AuthPage() {
  const [formType, setFormType] = useState('register');
  const [registerForm, setRegisterForm] = useState({ email: '', username: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ email: '', otp: '' });
  const [message, setMessage] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const quotes = [
    "Push yourself, because no one else is going to do it for you.",
    "Eat clean, train dirty.",
    "Your body can stand almost anything. It’s your mind that you have to convince.",
    "Success starts with self-discipline.",
    "Healthy habits = a better you."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      let res;

      if (type === 'register') {
        res = await API.post('api/users/register/', registerForm);
        setFormType('login');
        setRegisterForm({ email: '', username: '', password: '' });
      } else if (type === 'login') {
        res = await API.post('api/users/login/', loginForm);
      } else if (type === 'otp') {
          res = await API.post('api/users/verify-otp/', {
            email: otpForm.email,
            code: otpForm.otp,  
          });
      } else if (type === 'send-otp') {
        res = await API.post('api/users/send-otp/', { email: otpForm.email });
        setOtpSent(true);
      }

      setMessage(res.data.message || 'Success');
    } catch (err) {
      setMessage(
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border border-gray-300 dark:border-gray-700 bg-[#f6f1e7] dark:bg-gray-900 text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 rounded";

  const buttonClass =
    "w-full py-2 px-4 bg-black dark:bg-yellow-400 text-white dark:text-black font-semibold rounded hover:bg-[#f4c95d] dark:hover:bg-yellow-300 transition disabled:opacity-50";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#e0d7c8] dark:bg-gray-950 transition-all duration-300">
      {/* Quote Section */}
      <div
        className="md:w-1/2 min-h-[400px] relative bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('/images/gym/register-bg.jpg')`
        }}
      >
        <div className="absolute inset-0" />
        <div className="relative z-10 max-w-md text-center text-shadow-black space-y-6 px-6">
          <p className="text-lg italic animate-fade-in-out">❝ {quotes[quoteIndex]} ❞</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#f6f1e7] dark:bg-gray-900 text-black dark:text-white shadow-xl rounded-2xl p-8">
          {formType === 'register' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Create Account</h2>
              <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4">
                <input name="email" type="email" placeholder="Email" value={registerForm.email} onChange={handleChange(setRegisterForm)} className={inputClass} required />
                <input name="username" placeholder="Username" value={registerForm.username} onChange={handleChange(setRegisterForm)} className={inputClass} required />
                <input name="password" type="password" placeholder="Password" value={registerForm.password} onChange={handleChange(setRegisterForm)} className={inputClass} required />
                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? 'Please wait...' : 'Register'}
                </button>
              </form>
              <p className="mt-4 text-sm text-center">
                Already have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setFormType('login')}>Login</span>
              </p>
            </>
          )}

          {formType === 'login' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Login</h2>
              <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                <input name="email" type="email" placeholder="Email" value={loginForm.email} onChange={handleChange(setLoginForm)} className={inputClass} required />
                <input name="password" type="password" placeholder="Password" value={loginForm.password} onChange={handleChange(setLoginForm)} className={inputClass} required />
                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? 'Please wait...' : 'Login'}
                </button>
              </form>
              <p className="mt-4 text-sm text-center">
                Forgot password? <span className="text-blue-500 cursor-pointer" onClick={() => { setFormType('otp'); setOtpSent(false); }}>Login with OTP</span>
              </p>
              <p className="mt-2 text-sm text-center">
                Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setFormType('register')}>Register</span>
              </p>
            </>
          )}

          {formType === 'otp' && (
            <>
              <h2 className="text-2xl font-bold mb-4">OTP Login</h2>
              <form onSubmit={(e) => handleSubmit(e, otpSent ? 'otp' : 'send-otp')} className="space-y-4">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={otpForm.email}
                  onChange={handleChange(setOtpForm)}
                  className={inputClass}
                  required
                />

                {otpSent && (
                  <input
                    name="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otpForm.otp}
                    onChange={handleChange(setOtpForm)}
                    className={inputClass}
                    required
                  />
                )}

                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? 'Please wait...' : otpSent ? 'Login with OTP' : 'Send OTP'}
                </button>
              </form>
              <p className="mt-4 text-sm text-center">
                Prefer password? <span className="text-blue-500 cursor-pointer" onClick={() => setFormType('login')}>Back to Login</span>
              </p>
            </>
          )}

          {message && (
            <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
