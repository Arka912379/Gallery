import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/gallery', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="sticker">
            <Camera size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">Welcome Back</h1>
            <p className="text-sm font-medium text-black/60 dark:text-white/60">Login to your account</p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border-[3px] border-black bg-red-200 px-4 py-2 text-sm font-semibold dark:border-neutral-100 dark:bg-red-900/50">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="field-icon" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-11"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/70 dark:text-white/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={submitting} className="btn-coral w-full justify-center text-lg">
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-bold text-black/40 dark:text-white/40">
          <span className="h-[3px] flex-1 bg-black/10 dark:bg-white/10" /> OR
          <span className="h-[3px] flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <div className="flex gap-3">
          <Link to="/signup" className="btn-purple flex-1 justify-center">
            User Signup
          </Link>
          <Link to="/admin-signup" className="btn-white flex-1 justify-center">
            Admin Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
