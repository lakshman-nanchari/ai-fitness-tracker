// AuthPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

const PasswordField = ({ name, value, onChange, placeholder, required = true }) => {
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);
  const prevShow = useRef(show);

  useEffect(() => {
    if (prevShow.current !== show && inputRef.current === document.activeElement) {
      const pos = inputRef.current.selectionStart;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(pos, pos);
    }
    prevShow.current = show;
  }, [show]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete="new-password"
        className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-700 bg-[#f6f1e7] dark:bg-gray-900 text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 rounded"
      />
      <div
        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600 dark:text-gray-300 z-10"
        onClick={() => setShow(!show)}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </div>
    </div>
  );
};

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

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const now = Date.now() / 1000;
          if (decoded.exp < now) {
            toast.info('Session expired. Please login again.');
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            setFormType('login');
          }
        } catch {
          toast.error('Invalid session. Please login again.');
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          setFormType('login');
        }
      }
    };
    checkTokenExpiry();
  }, [formType]);

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
        localStorage.setItem('access', res.data.access);
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
        localStorage.setItem('reset_access', verifyRes.data.access);
        setResetVerified(true);

      } else if (type === 'reset-new-password') {
        const access = localStorage.getItem('reset_access');
        res = await API.post('api/users/change-password/', {
          new_password: resetForm.newPassword
        }, {
          headers: { Authorization: `Bearer ${access}` }
        });

        const loginRes = await API.post('api/users/login/', {
          email: resetForm.email,
          password: resetForm.newPassword
        });

        localStorage.setItem('access', loginRes.data.access);
        localStorage.setItem('refresh', loginRes.data.refresh);

        toast.success('Password reset and logged in!');
        setFormType('change');
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
        err.response?.data?.old_password?.[0] ||
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
      <div className="md:w-1/2 min-h-[400px] bg-cover bg-center flex items-start justify-center pt-10"
        style={{ backgroundImage: `url('/images/gym/register-bg.jpg')` }}>
        <div className="relative z-10 max-w-md text-center space-y-6 px-6">
          <p className="text-2xl italic animate-fade-in-out text-white drop-shadow-lg">❝ {quotes[quoteIndex]} ❞</p>
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#f6f1e7] dark:bg-gray-900 text-black dark:text-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center capitalize">{formType.replace('-', ' ')}</h2>

          {/* Registration */}
          {formType === 'register' && (
            <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4" autoComplete="off">
              <input type="text" name="username" placeholder="Username" className={inputClass} value={registerForm.username} onChange={handleChange(setRegisterForm)} required autoComplete="username" />
              <input type="email" name="email" placeholder="Email" className={inputClass} value={registerForm.email} onChange={handleChange(setRegisterForm)} required autoComplete="email" />
              <PasswordField name="password" placeholder="Password" value={registerForm.password} onChange={handleChange(setRegisterForm)} />
              <button className={buttonClass} type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
              <p className="text-sm mt-2 text-center">Already have an account? <span className="underline cursor-pointer" onClick={() => setFormType('login')}>Login</span></p>
            </form>
          )}

          {/* Login */}
          {formType === 'login' && (
            <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4" autoComplete="off">
              <input type="email" name="email" placeholder="Email" className={inputClass} value={loginForm.email} onChange={handleChange(setLoginForm)} required autoComplete="email" />
              <PasswordField name="password" placeholder="Password" value={loginForm.password} onChange={handleChange(setLoginForm)} />
              <button className={buttonClass} type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
              <div className="flex justify-between text-sm mt-2">
                <span className="underline cursor-pointer" onClick={() => setFormType('otp-login')}>Login with OTP</span>
                <span className="underline cursor-pointer" onClick={() => setFormType('reset')}>Forgot password?</span>
              </div>
              <p className="text-sm mt-2 text-center">New here? <span className="underline cursor-pointer" onClick={() => setFormType('register')}>Register</span></p>
            </form>
          )}

           {formType === 'otp-login' && (
              <form onSubmit={(e) => handleSubmit(e, otpSent ? 'otp-login-verify' : 'otp-login-send')} className="space-y-4">
                <input type="email" name="email" placeholder="Email" className={inputClass} value={otpForm.email} onChange={handleChange(setOtpForm)} required />
                {otpSent && (
                  <input type="text" name="otp" placeholder="Enter OTP" className={inputClass} value={otpForm.otp} onChange={handleChange(setOtpForm)} required />
                )}
                <button className={buttonClass} type="submit" disabled={loading}>{loading ? 'Processing...' : otpSent ? 'Verify OTP' : 'Send OTP'}</button>
                <div className="flex justify-between text-sm mt-2">
                  <span className="underline cursor-pointer" onClick={() => setFormType('login')}>Back to Login</span>
                  <span className="underline cursor-pointer" onClick={() => setFormType('register')}>Register</span>
                </div>
              </form>
            )}

            {formType === 'reset' && (
              <form onSubmit={(e) => handleSubmit(e, resetVerified ? 'reset-new-password' : resetOtpSent ? 'reset-verify' : 'reset-send')} className="space-y-4">
                <input type="email" name="email" placeholder="Email" className={inputClass} value={resetForm.email} onChange={handleChange(setResetForm)} required />
                {resetOtpSent && !resetVerified && (
                  <input type="text" name="otp" placeholder="Enter OTP" className={inputClass} value={resetForm.otp} onChange={handleChange(setResetForm)} required />
                )}
                {resetVerified && (
                  <PasswordField name="newPassword" placeholder="New Password" value={resetForm.newPassword} onChange={handleChange(setResetForm)} />
                )}
                <button className={buttonClass} type="submit" disabled={loading}>{loading ? 'Processing...' : resetVerified ? 'Set New Password' : resetOtpSent ? 'Verify OTP' : 'Send OTP'}</button>
                <p className="text-sm mt-2 text-center">Remembered? <span className="underline cursor-pointer" onClick={() => setFormType('login')}>Login</span></p>
              </form>
            )}

            {formType === 'change' && (
              <form onSubmit={(e) => handleSubmit(e, 'change-password')} className="space-y-4">
                <PasswordField name="newPassword" placeholder="New Password" value={changeForm.newPassword} onChange={handleChange(setChangeForm)} />
                <button className={buttonClass} type="submit" disabled={loading}>{loading ? 'Updating...' : 'Change Password'}</button>
                <p className="text-sm mt-2 text-center underline cursor-pointer" onClick={() => setFormType('login')}>Logout & Login again</p>
              </form>
            )}

        </div>
      </div>
    </div>
  );
}
