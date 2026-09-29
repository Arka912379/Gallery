import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { USER_NAV } from '../lib/nav';
import { api } from '../lib/api';

export default function ShowPhoto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [siblings, setSiblings] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // The full list (in the same order as the gallery) lets the prev/next arrows step through it.
  useEffect(() => {
    api
      .get('/photos')
      .then((data) => setSiblings(data.photos))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setError('');
    api
      .get(`/photos/${id}`)
      .then((data) => setPhoto(data.photo))
      .catch((err) => setError(err.message));
  }, [id]);

  const index = siblings.findIndex((p) => p.id === id);
  const goTo = (i) => {
    if (i >= 0 && i < siblings.length) navigate(`/photos/${siblings[i].id}`);
  };

  const toggleFavorite = async () => {
    if (!photo) return;
    setBusy(true);
    try {
      if (photo.isFavorite) await api.del(`/photos/${photo.id}/favorite`);
      else await api.post(`/photos/${photo.id}/favorite`);
      setPhoto((p) => ({ ...p, isFavorite: !p.isFavorite }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deletePhoto = async () => {
    if (!photo || !window.confirm('Delete this photo? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api.del(`/photos/${photo.id}`);
      navigate('/gallery', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Layout navItems={USER_NAV}>
      <div className="mx-auto max-w-xl">
        {error && (
          <p className="card-sm mb-4 bg-red-200 px-4 py-3 font-semibold dark:bg-red-900/50">{error}</p>
        )}

        {!photo ? (
          !error && <p className="font-semibold">Loading…</p>
        ) : (
          <div className="card overflow-hidden">
            <div className="relative">
              <img src={photo.url} alt={photo.title} className="aspect-square w-full border-b-[3px] border-black object-cover dark:border-neutral-100" />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-white p-2 shadow-brutal-sm dark:border-neutral-100 dark:bg-neutral-800"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {index >= 0 && index < siblings.length - 1 && (
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-white p-2 shadow-brutal-sm dark:border-neutral-100 dark:bg-neutral-800"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-extrabold">{photo.title}</h1>
              <p className="mt-1 text-sm font-medium text-black/60 dark:text-white/60">
                {new Date(photo.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} · {photo.category}
              </p>

              <div className="mt-5 flex gap-3">
                <button type="button" disabled={busy} onClick={toggleFavorite} className="btn-purple flex-1 justify-center">
                  <Heart size={18} fill={photo.isFavorite ? 'black' : 'none'} />
                  {photo.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button type="button" disabled={busy} onClick={deletePhoto} className="btn-coral flex-1 justify-center">
                  <Trash2 size={18} /> Delete Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
