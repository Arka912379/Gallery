import { useCallback, useEffect, useState } from 'react';
import { Heart, Images, Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { ADMIN_NAV } from '../lib/nav';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="card-sm flex items-center gap-3 p-4">
      <span className="rounded-xl border-[3px] border-black bg-purple-300 p-2 dark:border-neutral-100">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-xs font-semibold text-black/60 dark:text-white/60">{label}</p>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-3xl font-extrabold">Admin Overview</h1>
      <p className="mb-6 text-sm font-medium text-black/60 dark:text-white/60">A snapshot of the whole gallery</p>
      {error && <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Total Users" value={stats.users} icon={Users} />
          <Stat label="Total Photos" value={stats.photos} icon={Images} />
          <Stat label="Total Favorites" value={stats.favorites} icon={Heart} />
        </div>
      )}
    </div>
  );
}

function PhotosAdmin() {
  const [photos, setPhotos] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      const { photos: list } = await api.get(`/admin/photos${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      setPhotos(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 250);
    return () => clearTimeout(t);
  }, [query, load]);

  const remove = async (photo) => {
    if (!window.confirm(`Delete "${photo.title}"? This cannot be undone.`)) return;
    try {
      await api.del(`/photos/${photo.id}`);
      setPhotos((list) => list.filter((p) => p.id !== photo.id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Manage Photos</h1>
        <div className="relative w-full max-w-xs">
          <Search size={18} className="field-icon" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search photos…" className="input-field" />
        </div>
      </div>
      {error && <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>}
      {loading ? (
        <p className="font-semibold">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b-[3px] border-black text-sm font-bold dark:border-neutral-100">
                <th className="p-3">Photo</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Category</th>
                <th className="p-3">Favorites</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {photos.map((p) => (
                <tr key={p.id} className="border-b border-black/10 dark:border-white/10">
                  <td className="flex items-center gap-3 p-3 font-semibold">
                    <img src={p.url} alt={p.title} className="h-10 w-10 rounded-lg border-2 border-black object-cover dark:border-neutral-100" />
                    {p.title}
                  </td>
                  <td className="p-3 text-sm">{p.owner}</td>
                  <td className="p-3 text-sm">{p.category}</td>
                  <td className="p-3 text-sm">{p.favoritesCount}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => remove(p)} className="btn-coral !px-3 !py-1.5 text-sm">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {photos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center font-semibold text-black/50 dark:text-white/50">
                    No photos found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersAdmin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users: list } = await api.get('/admin/users');
      setUsers(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRole = async (u) => {
    const role = u.role === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role });
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role } : x)));
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.email}? This removes their account and all their photos.`)) return;
    try {
      await api.del(`/admin/users/${u.id}`);
      setUsers((list) => list.filter((x) => x.id !== u.id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">Manage Users</h1>
      {error && <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>}
      {loading ? (
        <p className="font-semibold">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b-[3px] border-black text-sm font-bold dark:border-neutral-100">
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Photos</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-black/10 dark:border-white/10">
                  <td className="p-3 font-semibold">{u.email}</td>
                  <td className="p-3">
                    <span className="badge-pill">{u.role === 'admin' ? 'Admin' : 'User'}</span>
                  </td>
                  <td className="p-3 text-sm">{u.photoCount}</td>
                  <td className="p-3 text-right">
                    {u.id !== me.id && (
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => toggleRole(u)} className="btn-white !px-3 !py-1.5 text-sm">
                          <ShieldCheck size={14} /> Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button type="button" onClick={() => removeUser(u)} className="btn-coral !px-3 !py-1.5 text-sm">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FavoritesAdmin() {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/photos?favorites=true')
      .then((data) => setPhotos(data.photos))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-3xl font-extrabold">All Favorites</h1>
      <p className="mb-6 text-sm font-medium text-black/60 dark:text-white/60">Every photo that has been favorited, across all users</p>
      {error && <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>}
      {loading ? (
        <p className="font-semibold">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="card p-6 text-center font-semibold text-black/50 dark:text-white/50">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="card-sm overflow-hidden">
              <img src={p.url} alt={p.title} className="aspect-square w-full border-b-[3px] border-black object-cover dark:border-neutral-100" />
              <div className="p-3">
                <p className="truncate font-bold">{p.title}</p>
                <p className="text-xs font-medium text-black/60 dark:text-white/60">by {p.owner}</p>
                <p className="mt-1 text-xs font-semibold">♥ {p.favoritesCount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ section }) {
  return (
    <Layout navItems={ADMIN_NAV}>
      {section === 'photos' && <PhotosAdmin />}
      {section === 'users' && <UsersAdmin />}
      {section === 'favorites' && <FavoritesAdmin />}
      {section === 'overview' && <Overview />}
    </Layout>
  );
}
