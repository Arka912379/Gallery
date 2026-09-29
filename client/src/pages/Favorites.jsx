import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PhotoCard from '../components/PhotoCard';
import { USER_NAV } from '../lib/nav';
import { api } from '../lib/api';

export default function Favorites() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { photos: list } = await api.get('/photos?favorites=true');
      setPhotos(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFavorite = async (photo) => {
    setPhotos((list) => list.filter((p) => p.id !== photo.id));
    try {
      await api.del(`/photos/${photo.id}/favorite`);
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  return (
    <Layout navItems={USER_NAV}>
      <h1 className="mb-1 text-3xl font-extrabold">Your Favorites</h1>
      <p className="mb-6 text-sm font-medium text-black/60 dark:text-white/60">All your favorite photos</p>

      {error && <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>}

      {loading ? (
        <p className="font-semibold">Loading…</p>
      ) : photos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-bold">No favorites yet</p>
          <p className="mt-1 text-black/60 dark:text-white/60">Tap the heart on any photo to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={{ ...photo, isFavorite: true }} onToggleFavorite={removeFavorite} />
          ))}
        </div>
      )}
    </Layout>
  );
}
