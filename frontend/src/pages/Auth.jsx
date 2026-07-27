import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // clear error on type
  };

  const validateEmail = (email) => {
    return /\.edu$|\.ac\.in$/.test(email.toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { name, email, password, confirmPassword } = formData;

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!name) {
        setError('Please provide your name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    // Validate university domain
    if (!validateEmail(email)) {
      setError('Access restricted. You must register with a valid university email address (.edu or .ac.in).');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center px-margin-mobile py-lg bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-md md:p-lg border border-outline-variant/10 shadow-lg relative overflow-hidden">
        
        {/* Design system decorative gradient corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-md relative z-10">
          <div className="inline-flex items-center gap-xs bg-tertiary/10 text-tertiary px-3.5 py-1 rounded-full mb-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] fill-icon">verified_user</span>
            Student-Only Verified Network
          </div>
          <h2 className="font-extrabold text-2xl text-on-surface">
            {isLogin ? 'Welcome to CampusLoop' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {isLogin
              ? 'Sign in to access student-exclusive listings and chats.'
              : 'Register using your university email address.'}
          </p>
        </div>

        {error && (
          <div className="mb-md p-sm bg-error-container/20 border border-error-container text-error rounded-xl text-xs flex gap-xs items-center leading-snug">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-sm relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full h-11 px-sm bg-surface-container border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface text-sm transition-all outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Campus Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane.doe@university.edu"
              className="w-full h-11 px-sm bg-surface-container border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface text-sm transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-11 px-sm bg-surface-container border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface text-sm transition-all outline-none"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-11 px-sm bg-surface-container border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface text-sm transition-all outline-none"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-md py-3 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                Please wait...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Register'
            )}
          </Button>
        </form>

        <div className="mt-md text-center text-xs relative z-10 border-t border-outline-variant/10 pt-md">
          <span className="text-on-surface-variant">
            {isLogin ? "Don't have an account? " : 'Already registered? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Register now' : 'Sign in here'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Auth;
