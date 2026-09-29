import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PhotoCard({ photo, onToggleFavorite }) {
  const navigate = useNavigate();

  return (
    <div className="card-sm group overflow-hidden">
      <button
        type="button"
        onClick={() => navigate(`/photos/${photo.id}`)}
        className="block aspect-square w-full overflow-hidden border-b-[3px] border-black dark:border-neutral-100"
      >
        <img
          src={photo.url}
          alt={photo.title}
          className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-105"
        />
      </button>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{photo.title}</p>
          <p className="text-xs font-medium text-black/60 dark:text-white/60">{photo.category}</p>
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(photo)}
            aria-label={photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`shrink-0 rounded-lg border-[3px] border-black p-1.5 dark:border-neutral-100 ${
              photo.isFavorite ? 'bg-coral-400' : 'bg-white dark:bg-neutral-800'
            }`}
          >
            <Heart size={16} fill={photo.isFavorite ? 'black' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
}
