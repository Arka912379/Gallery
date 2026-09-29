import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function UserSignup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setSubmitting(true);
    try {
      await signup(form.email, form.password, form.confirmPassword);
      navigate('/gallery', { replace: true });
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
            <h1 className="text-2xl font-extrabold leading-tight">Create Account</h1>
            <p className="text-sm font-medium text-black/60 dark:text-white/60">Join to share your photos</p>
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
            <input type="email" required placeholder="Email" value={form.email} onChange={update('email')} className="input-field" autoComplete="email" />
          </div>
          <div className="relative">
            <Lock size={18} className="field-icon" />
            <input type="password" required minLength={6} placeholder="Password" value={form.password} onChange={update('password')} className="input-field" autoComplete="new-password" />
          </div>
          <div className="relative">
            <Lock size={18} className="field-icon" />
            <input type="password" required minLength={6} placeholder="Confirm Password" value={form.confirmPassword} onChange={update('confirmPassword')} className="input-field" autoComplete="new-password" />
          </div>

          <button type="submit" disabled={submitting} className="btn-coral w-full justify-center text-lg">
            {submitting ? 'Creating account…' : 'Signup'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-purple-600 underline dark:text-purple-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
