import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AuthPage() {
  const [formType, setFormType] = useState('register');
  const [registerForm, setRegisterForm] = useState({ email: '', username: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ email: '', otp: '' });
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '' });
  const [changeForm, setChangeForm] = useState({ oldPassword: '', newPassword: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetVerified, setResetVerified] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
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
    setLoading(true);

    try {
      let res;

      if (type === 'register') {
        res = await API.post('api/users/register/', registerForm);
        toast.success(res.data.message || 'Registered!');
        setFormType('login');
        setRegisterForm({ email: '', username: '', password: '' });

      } else if (type === 'login') {
        res = await API.post('api/users/login/', loginForm);
        toast.success('Login successful!');
        localStorage.setItem('access', res.data.access); // save JWT
        localStorage.setItem('refresh', res.data.refresh);

      } else if (type === 'otp-login-send') {
        res = await API.post('api/users/send-otp/', { email: otpForm.email });
        toast.success(res.data.message || 'OTP sent!');
        setOtpSent(true);

      } else if (type === 'otp-login-verify') {
        res = await API.post('api/users/verify-otp/', { email: otpForm.email, code: otpForm.otp });
        toast.success(res.data.message || 'OTP verified!');
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);

      } else if (type === 'reset-send') {
        res = await API.post('api/users/reset-password/', { email: resetForm.email });
        toast.success(res.data.message || 'Reset OTP sent!');
        setResetOtpSent(true);

      } else if (type === 'reset-verify') {
        const verifyRes = await API.post('api/users/verify-otp/', {
          email: resetForm.email,
          code: resetForm.otp,
        });
        toast.success('OTP verified. Set new password.');
        localStorage.setItem('reset_access', verifyRes.data.access); // temporary
        setResetVerified(true);

      } else if (type === 'reset-new-password') {
        const access = localStorage.getItem('reset_access');
        res = await API.post('api/users/change-password/', {
          old_password: 'dummy', // backend skips this if not used
          new_password: resetForm.newPassword
        }, { headers: { Authorization: `Bearer ${access}` } });

        toast.success(res.data.message || 'Password reset!');
        setFormType('login');
        setResetForm({ email: '', otp: '', newPassword: '' });
        setResetOtpSent(false);
        setResetVerified(false);
        localStorage.removeItem('reset_access');

      } else if (type === 'change-password') {
        const token = localStorage.getItem('access');
        res = await API.post('api/users/change-password/', changeForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message || 'Password changed!');
        setChangeForm({ oldPassword: '', newPassword: '' });
      }

    } catch (err) {
      toast.error(
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 dark:border-gray-700 bg-[#f6f1e7] dark:bg-gray-900 text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 rounded";
  const buttonClass = "w-full py-2 px-4 bg-black dark:bg-yellow-400 text-white dark:text-black font-semibold rounded hover:bg-[#f4c95d] dark:hover:bg-yellow-300 transition disabled:opacity-50";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#e0d7c8] dark:bg-gray-950 transition-all duration-300">
      {/* Quote Side */}
      <div className="md:w-1/2 min-h-[400px] relative bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('/images/gym/register-bg.jpg')` }}>
        <div className="absolute inset-0" />
        <div className="relative z-10 max-w-md text-center space-y-6 px-6">
          <p className="text-lg italic animate-fade-in-out">❝ {quotes[quoteIndex]} ❞</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#f6f1e7] dark:bg-gray-900 text-black dark:text-white shadow-xl rounded-2xl p-8">
          {/* Register */}
          {formType === 'register' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Create Account</h2>
              <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4">
                <input name="email" type="email" placeholder="Email" value={registerForm.email} onChange={handleChange(setRegisterForm)} className={inputClass} required />
                <input name="username" placeholder="Username" value={registerForm.username} onChange={handleChange(setRegisterForm)} className={inputClass} required />
                <input name="password" type="password" placeholder="Password" value={registerForm.password} onChange={handleChange(setRegisterForm)} className={inputClass} required />
                <button type="submit" className={buttonClass} disabled={loading}>{loading ? 'Please wait...' : 'Register'}</button>
              </form>
              <p className="mt-4 text-sm text-center">Already have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setFormType('login')}>Login</span></p>
            </>
          )}

          {/* Login */}
          {formType === 'login' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Login</h2>
              <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                <input name="email" type="email" placeholder="Email" value={loginForm.email} onChange={handleChange(setLoginForm)} className={inputClass} required />
                <input name="password" type="password" placeholder="Password" value={loginForm.password} onChange={handleChange(setLoginForm)} className={inputClass} required />
                <button type="submit" className={buttonClass} disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
              </form>
              <p className="mt-4 text-sm text-center">Forgot password? <span className="text-blue-500 cursor-pointer" onClick={() => setFormType('reset')}>Reset it</span></p>
              <p className="mt-2 text-sm text-center">Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setFormType('register')}>Register</span></p>
            </>
          )}

          {/* OTP Login */}
          {formType === 'otp' && (
            <>
              <h2 className="text-2xl font-bold mb-4">OTP Login</h2>
              <form onSubmit={(e) => handleSubmit(e, otpSent ? 'otp-login-verify' : 'otp-login-send')} className="space-y-4">
                <input name="email" type="email" placeholder="Email" value={otpForm.email} onChange={handleChange(setOtpForm)} className={inputClass} required />
                {otpSent && (
                  <input name="otp" type="text" placeholder="Enter OTP" value={otpForm.otp} onChange={handleChange(setOtpForm)} className={inputClass} required />
                )}
                <button type="submit" className={buttonClass} disabled={loading}>{loading ? 'Please wait...' : otpSent ? 'Login with OTP' : 'Send OTP'}</button>
              </form>
              <p className="mt-4 text-sm text-center"><span className="text-blue-500 cursor-pointer" onClick={() => setFormType('login')}>Back to Login</span></p>
            </>
          )}

          {/* Reset Password */}
          {formType === 'reset' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
              <form onSubmit={(e) =>
                handleSubmit(e, !resetOtpSent ? 'reset-send' : !resetVerified ? 'reset-verify' : 'reset-new-password')
              } className="space-y-4">
                <input name="email" type="email" placeholder="Email" value={resetForm.email} onChange={handleChange(setResetForm)} className={inputClass} required />
                {resetOtpSent && (
                  <input name="otp" type="text" placeholder="Enter OTP" value={resetForm.otp} onChange={handleChange(setResetForm)} className={inputClass} required />
                )}
                {resetVerified && (
                  <input name="newPassword" type="password" placeholder="New Password" value={resetForm.newPassword} onChange={handleChange(setResetForm)} className={inputClass} required />
                )}
                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? 'Please wait...' :
                    !resetOtpSent ? 'Send OTP' :
                      !resetVerified ? 'Verify OTP' :
                        'Set New Password'}
                </button>
              </form>
              <p className="mt-4 text-sm text-center"><span className="text-blue-500 cursor-pointer" onClick={() => setFormType('login')}>Back to Login</span></p>
            </>
          )}

          {/* Change Password (after login) */}
          {formType === 'change' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Change Password</h2>
              <form onSubmit={(e) => handleSubmit(e, 'change-password')} className="space-y-4">
                <input name="oldPassword" type="password" placeholder="Current Password" value={changeForm.oldPassword} onChange={handleChange(setChangeForm)} className={inputClass} required />
                <input name="newPassword" type="password" placeholder="New Password" value={changeForm.newPassword} onChange={handleChange(setChangeForm)} className={inputClass} required />
                <button type="submit" className={buttonClass} disabled={loading}>{loading ? 'Please wait...' : 'Change Password'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
