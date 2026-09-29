import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Trash2, User } from 'lucide-react';
import Layout from '../components/Layout';
import { USER_NAV } from '../lib/nav';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({ photos: 0, favorites: 0 });
  const [name, setName] = useState(user?.name || '');
  const [nameMsg, setNameMsg] = useState('');
  const [nameError, setNameError] = useState('');

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const [avatarError, setAvatarError] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    api
      .get('/users/me')
      .then((data) => setStats(data.stats))
      .catch(() => {});
  }, []);

  const saveName = async (e) => {
    e.preventDefault();
    setNameMsg('');
    setNameError('');
    try {
      const { user: u } = await api.put('/users/me', { name });
      setUser(u);
      setNameMsg('Profile updated');
    } catch (err) {
      setNameError(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (pw.newPassword !== pw.confirmNewPassword) return setPwError('New passwords do not match');
    try {
      await api.put('/users/me/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPwMsg('Password updated');
    } catch (err) {
      setPwError(err.message);
    }
  };

  const pickAvatar = async (file) => {
    if (!file) return;
    setAvatarError('');
    setAvatarBusy(true);
    const body = new FormData();
    body.append('avatar', file);
    try {
      const { user: u } = await api.put('/users/me/avatar', body, { isForm: true });
      setUser(u);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarBusy(true);
    try {
      const { user: u } = await api.del('/users/me/avatar');
      setUser(u);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarBusy(false);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    try {
      await api.del('/users/me', { password: deletePassword });
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <Layout navItems={USER_NAV}>
      <h1 className="mb-6 text-3xl font-extrabold">Profile</h1>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="card flex flex-col items-center gap-4 p-6 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-[3px] border-black bg-purple-200 dark:border-neutral-100">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User size={40} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={avatarBusy} onClick={() => fileInputRef.current?.click()} className="btn-purple !px-3 !py-2 text-sm">
              <Camera size={16} /> Change
            </button>
            {user?.avatarUrl && (
              <button type="button" disabled={avatarBusy} onClick={removeAvatar} className="btn-white !px-3 !py-2 text-sm">
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => pickAvatar(e.target.files?.[0])}
          />
          {avatarError && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{avatarError}</p>}

          <div>
            <p className="text-lg font-bold">{user?.email}</p>
            <span className="badge-pill mt-2">{user?.role === 'admin' ? 'Administrator' : 'Member'}</span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 pt-2">
            <div className="card-sm p-3">
              <p className="text-2xl font-extrabold">{stats.photos}</p>
              <p className="text-xs font-semibold text-black/60 dark:text-white/60">Photos</p>
            </div>
            <div className="card-sm p-3">
              <p className="text-2xl font-extrabold">{stats.favorites}</p>
              <p className="text-xs font-semibold text-black/60 dark:text-white/60">Favorites</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={saveName} className="card space-y-3 p-6">
            <h2 className="text-lg font-extrabold">Display name</h2>
            {nameMsg && <p className="text-sm font-semibold text-green-700 dark:text-green-400">{nameMsg}</p>}
            {nameError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{nameError}</p>}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="input-field !pl-4" placeholder="Your name" />
            <button type="submit" className="btn-purple">
              Save
            </button>
          </form>

          <form onSubmit={changePassword} className="card space-y-3 p-6">
            <h2 className="text-lg font-extrabold">Change password</h2>
            {pwMsg && <p className="text-sm font-semibold text-green-700 dark:text-green-400">{pwMsg}</p>}
            {pwError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{pwError}</p>}
            <input
              type="password"
              required
              placeholder="Current password"
              value={pw.currentPassword}
              onChange={(e) => setPw((s) => ({ ...s, currentPassword: e.target.value }))}
              className="input-field !pl-4"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={pw.newPassword}
              onChange={(e) => setPw((s) => ({ ...s, newPassword: e.target.value }))}
              className="input-field !pl-4"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirm new password"
              value={pw.confirmNewPassword}
              onChange={(e) => setPw((s) => ({ ...s, confirmNewPassword: e.target.value }))}
              className="input-field !pl-4"
            />
            <button type="submit" className="btn-purple">
              Update Password
            </button>
          </form>

          {user?.role !== 'admin' && (
            <div className="card space-y-3 border-red-500 p-6 dark:border-red-400">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-red-600 dark:text-red-400">
                <Trash2 size={18} /> Delete account
              </h2>
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                This permanently deletes your account and every photo you uploaded.
              </p>
              {!confirmingDelete ? (
                <button type="button" onClick={() => setConfirmingDelete(true)} className="btn-coral">
                  Delete My Account
                </button>
              ) : (
                <form onSubmit={deleteAccount} className="space-y-3">
                  {deleteError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{deleteError}</p>}
                  <input
                    type="password"
                    required
                    placeholder="Confirm your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="input-field !pl-4"
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="btn-coral flex-1 justify-center">
                      Confirm Delete
                    </button>
                    <button type="button" onClick={() => setConfirmingDelete(false)} className="btn-white flex-1 justify-center">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
