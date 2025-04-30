import React from 'react';
import { Link } from 'react-router-dom';

const ComicCard = ({ comic }) => {
  const getTypeClass = () => {
    const type = comic.type.toLowerCase();
    if (type.includes('manga')) return 'badge-manga';
    if (type.includes('manhwa')) return 'badge-manhwa';
    if (type.includes('manhua')) return 'badge-manhua';
    return '';
  };

  return (
    <Link to={`/comic/${comic.slug}`} className="block">
      <div className="comic-card">
        <div className="comic-thumbnail">
          <img src={comic.thumb} alt={comic.title} loading="lazy" />
          <div className="absolute top-2 left-2">
            <span className={`badge ${getTypeClass()}`}>{comic.type}</span>
          </div>
          {comic.chapter && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <span className="text-white text-xs">{comic.chapter}</span>
            </div>
          )}
        </div>
        <div className="comic-info">
          <h3 className="comic-title">{comic.title}</h3>
          <div className="comic-meta">
            <div className="comic-rating">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>{comic.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ComicCard;