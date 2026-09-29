import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Search, User } from 'lucide-react';
import Layout from '../components/Layout';
import PhotoCard from '../components/PhotoCard';
import { USER_NAV } from '../lib/nav';
import { api } from '../lib/api';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : '';
      const { photos: list } = await api.get(`/photos${params}`);
      setPhotos(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(query), 250);
    return () => clearTimeout(timer);
  }, [query, load]);

  const toggleFavorite = async (photo) => {
    setPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, isFavorite: !p.isFavorite } : p)));
    try {
      if (photo.isFavorite) await api.del(`/photos/${photo.id}/favorite`);
      else await api.post(`/photos/${photo.id}/favorite`);
    } catch {
      setPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, isFavorite: photo.isFavorite } : p)));
    }
  };

  return (
    <Layout navItems={USER_NAV}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Your Gallery</h1>
        <div className="flex gap-3">
          <Link to="/favorites" className="btn-purple">
            <Heart size={18} /> Favorites
          </Link>
          <Link to="/profile" className="btn-white">
            <User size={18} /> Profile
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/add-photo" className="btn-coral">
          <Plus size={18} /> Add Photo
        </Link>
        <div className="relative w-full max-w-xs">
          <Search size={18} className="field-icon" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            className="input-field"
          />
        </div>
      </div>

      {error && <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>}

      {loading ? (
        <p className="font-semibold">Loading photos…</p>
      ) : photos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-bold">No photos yet</p>
          <p className="mt-1 text-black/60 dark:text-white/60">Add your first photo to get started.</p>
          <Link to="/add-photo" className="btn-coral mt-5 inline-flex">
            <Plus size={18} /> Add Photo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </Layout>
  );
}
