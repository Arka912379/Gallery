import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag, Type, UploadCloud } from 'lucide-react';
import Layout from '../components/Layout';
import { USER_NAV } from '../lib/nav';
import { api } from '../lib/api';

const CATEGORIES = ['Nature', 'Animals', 'City', 'Travel', 'People', 'Food', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function AddPhoto() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(today());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('Choose a photo to upload');
    if (!title.trim()) return setError('Title is required');

    const body = new FormData();
    body.append('photo', file);
    body.append('title', title.trim());
    body.append('category', category);
    body.append('date', date);

    setSubmitting(true);
    try {
      await api.post('/photos', body, { isForm: true });
      navigate('/gallery');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout navItems={USER_NAV}>
      <h1 className="mb-6 text-3xl font-extrabold">Add New Photo</h1>
      <div className="card mx-auto max-w-lg p-6">
        <p className="mb-5 text-sm font-medium text-black/60 dark:text-white/60">Upload your photo to gallery</p>

        {error && (
          <p className="mb-4 rounded-xl border-[3px] border-black bg-red-200 px-4 py-2 text-sm font-semibold dark:border-neutral-100 dark:bg-red-900/50">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="photo-input"
            className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-dashed border-black bg-neutral-50 text-center dark:border-neutral-100 dark:bg-neutral-800"
          >
            {preview ? (
              <img src={preview} alt="Selected preview" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <>
                <UploadCloud size={28} />
                <span className="font-semibold">Choose a photo</span>
                <span className="text-xs text-black/50 dark:text-white/50">or drag and drop</span>
              </>
            )}
            <input
              id="photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </label>

          <div className="relative">
            <Type size={18} className="field-icon" />
            <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" maxLength={100} />
          </div>

          <div className="relative">
            <Tag size={18} className="field-icon" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field appearance-none">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar size={18} className="field-icon" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" max={today()} />
          </div>

          <button type="submit" disabled={submitting} className="btn-coral w-full justify-center text-lg">
            {submitting ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
