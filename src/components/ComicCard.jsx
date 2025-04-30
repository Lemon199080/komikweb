import React from 'react';
import { Link } from 'react-router-dom';

const ComicCard = ({ comic, viewMode = 'grid' }) => {
  // Handle potential undefined comic props safely
  if (!comic) return null;

  // Truncate title if it's too long
  const truncateTitle = (title) => {
    if (!title) return 'Untitled';
    return title.length > 20 ? `${title.substring(0, 20)}...` : title;
  };

  // Get type class for styling based on comic type
  const getTypeClass = () => {
    if (!comic.type) return 'bg-gray-600';
    const type = String(comic.type).toLowerCase();
    if (type.includes('manga')) return 'bg-blue-600';
    if (type.includes('manhwa')) return 'bg-green-600';
    if (type.includes('manhua')) return 'bg-purple-600';
    return 'bg-gray-600';
  };

  // Get image URL with proper fallback handling
  const getImageUrl = () => {
    return comic.cover || comic.thumb || comic.thumbnail || comic.image || '/api/placeholder/300/300';
  };

  // Format chapter display text safely
  const getChapterText = () => {
    if (comic.chapter) return comic.chapter;
    if (comic.latestChapter) return comic.latestChapter;
    return 'No chapters yet';
  };

  console.log('Rendering comic card for:', comic.slug, {
    imageUrl: getImageUrl(),
    chapter: getChapterText(),
  });

  return (
    <Link
      to={`/comic/${comic.slug}`}
      className={`block transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
        viewMode === 'list' ? 'flex gap-x-4 items-start' : ''
      }`}
      aria-label={`View details for ${comic.title || 'Untitled'}`}
    >
      <div className="relative">
        <img
          src={getImageUrl()}
          alt={comic.title || 'Comic cover'}
          className={`${
            viewMode === 'grid' ? 'w-full' : 'w-24 md:w-32'
          } rounded-lg h-60 object-cover transition-opacity duration-300`}
          loading="lazy"
          onError={(e) => {
            console.log(`Image load error for ${comic.slug}. Falling back to placeholder`);
            e.target.src = '/api/placeholder/300/300';
          }}
        />

        {/* Comic type badge */}
        {comic.type && (
          <div className="absolute top-2 left-2">
            <span
              className={`badge ${getTypeClass()} text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm transition-opacity duration-300`}
            >
              {comic.type}
            </span>
          </div>
        )}

        {/* Country flag if available */}
        {comic.country && comic.countryFlag && (
          <img
            src={comic.countryFlag}
            alt={`${comic.country} flag`}
            className="absolute bottom-2 right-2 w-8 h-6 rounded-sm shadow-sm"
            onError={(e) => {
              console.log(`Flag load error for ${comic.slug}. Removing flag element`);
              e.target.style.display = 'none';
            }}
          />
        )}
      </div>

      <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-3'}`}>
        {/* Title and status */}
        <div className="flex items-center h-8 space-x-2">
          {comic.status === 'UP' && (
            <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              UP
            </span>
          )}
          <h3
            className="text-white font-semibold text-base md:text-lg truncate"
            title={comic.title || 'Untitled'}
          >
            {truncateTitle(comic.title)}
          </h3>
        </div>

        {/* Rating if available */}
        {comic.rating && (
          <div className="mt-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs ml-1">{comic.rating}</span>
          </div>
        )}

        {/* Chapters */}
        <div className="mt-2">
          <div className="bg-gray-700/80 rounded-lg px-3 py-2 text-white text-sm">
            <span className="truncate">{getChapterText()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ComicCard;