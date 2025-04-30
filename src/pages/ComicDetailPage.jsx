import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ComicCard from '../components/ComicCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const API_URL = 'https://api.zeds.rocks';

// Button components
const PrimaryButton = ({ icon, children, onClick, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    aria-label={children}
  >
    {icon}
    {children}
  </button>
);

const SecondaryButton = ({ icon, children, onClick, isActive = false, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 ${
      isActive ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    } font-medium py-3 px-4 rounded-lg border border-gray-700 transition-all duration-200 ${className}`}
    aria-label={children}
  >
    {icon}
    {children}
  </button>
);

const Chip = ({ children, className = '' }) => (
  <span className={`inline-block bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

const ComicDetailPage = () => {
  const { slug } = useParams();
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chapters');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [inReadlist, setInReadlist] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);

  useEffect(() => {
    const fetchComicDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check cache first
        const cachedComic = JSON.parse(localStorage.getItem(`comic_${slug}`) || '{}');
        if (cachedComic && Date.now() - cachedComic.cachedAt < 24 * 60 * 60 * 1000) {
          setComic(cachedComic.data);
          setChapters(cachedComic.chapters || []);
          setIsBookmarked(JSON.parse(localStorage.getItem('bookmarks') || '[]').includes(slug));
          setInReadlist(JSON.parse(localStorage.getItem('readlist') || '[]').includes(slug));
          setLoading(false);
          return;
        }

        // Fetch comic details
        const detailsResponse = await fetch(`${API_URL}/comics/${slug}`);
        if (!detailsResponse.ok) throw new Error('Failed to fetch comic details');
        const responseData = await detailsResponse.json();
        if (!responseData.success) throw new Error(responseData.message || 'Failed to load comic data');
        setComic(responseData.data);

        // Fetch chapters
        const chaptersResponse = await fetch(`${API_URL}/comics/${slug}/chapters`);
        if (!chaptersResponse.ok) throw new Error('Failed to fetch chapters');
        const chaptersData = await chaptersResponse.json();
        setChapters(chaptersData.chapters);

        // Cache the data
        localStorage.setItem(
          `comic_${slug}`,
          JSON.stringify({
            data: responseData.data,
            chapters: chaptersData.chapters,
            cachedAt: Date.now(),
          })
        );

        // Check bookmarks and readlist
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(slug));
        const readlist = JSON.parse(localStorage.getItem('readlist') || '[]');
        setInReadlist(readlist.includes(slug));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      setRecommendationsLoading(true);
      try {
        const cachedRecommendations = JSON.parse(localStorage.getItem('recommendations') || '{}');
        if (cachedRecommendations && Date.now() - cachedRecommendations.cachedAt < 24 * 60 * 60 * 1000) {
          setRecommendations(cachedRecommendations.data);
          setRecommendationsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/comics?page=2`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        const comics = data.comics || data || [];
        setRecommendations(comics);

        localStorage.setItem(
          'recommendations',
          JSON.stringify({
            data: comics,
            cachedAt: Date.now(),
          })
        );
      } catch (err) {
        setRecommendationsError(err.message);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchComicDetails();
    fetchRecommendations();
    window.scrollTo(0, 0);
  }, [slug]);

// Perbaiki fungsi toggleBookmark dan toggleReadlist di ComicDetailPage.js

const toggleBookmark = () => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  
  console.log('Current bookmarks:', bookmarks);
  console.log('Current comic slug:', slug);
  
  if (isBookmarked) {
    // Remove from bookmarks
    const updatedBookmarks = bookmarks.filter((id) => id !== slug);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    console.log('Updated bookmarks after removal:', updatedBookmarks);
    toast.success('Removed from Bookmarks', { autoClose: 2000 });
  } else {
    // Add to bookmarks if not already there
    if (!bookmarks.includes(slug)) {
      const updatedBookmarks = [...bookmarks, slug];
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      console.log('Updated bookmarks after addition:', updatedBookmarks);
      toast.success('Added to Bookmarks', { autoClose: 2000 });
    }
  }
  
  setIsBookmarked(!isBookmarked);
  
  // Dispatch both events for compatibility
  window.dispatchEvent(new Event('storage')); 
  window.dispatchEvent(new Event('localStorageChange'));
};

const toggleReadlist = () => {
  const readlist = JSON.parse(localStorage.getItem('readlist') || '[]');
  
  console.log('Current readlist:', readlist);
  console.log('Current comic slug:', slug);
  
  if (inReadlist) {
    // Remove from readlist
    const updatedReadlist = readlist.filter((id) => id !== slug);
    localStorage.setItem('readlist', JSON.stringify(updatedReadlist));
    console.log('Updated readlist after removal:', updatedReadlist);
    toast.success('Removed from Readlist', { autoClose: 2000 });
  } else {
    // Add to readlist if not already there
    if (!readlist.includes(slug)) {
      const updatedReadlist = [...readlist, slug];
      localStorage.setItem('readlist', JSON.stringify(updatedReadlist));
      console.log('Updated readlist after addition:', updatedReadlist);
      toast.success('Added to Readlist', { autoClose: 2000 });
    }
  }
  
  setInReadlist(!inReadlist);
  
  // Dispatch both events for compatibility
  window.dispatchEvent(new Event('storage')); 
  window.dispatchEvent(new Event('localStorageChange'));
};

  const startReading = () => {
    if (chapters && chapters.length > 0) {
      return `/read/${chapters[chapters.length - 1].slug}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="space-y-2">
          <div className="w-20 h-20 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
          <p className="text-gray-300 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 px-4">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Oops!</h2>
          <p className="text-gray-400 mb-6">{error || 'Comic not found'}</p>
          <Link
            to="/"
            className="inline-block bg-purple-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with blurred background image */}
      <div className="relative h-72 md:h-96 bg-black overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${comic.thumbnail})`,
            filter: 'blur(12px)',
            transform: 'scale(1.1)',
            opacity: 0.4,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-gray-900/90"></div>
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-200 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12 -mt-36 relative z-10">
        {/* Comic showcase */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="md:flex relative">
            {/* Cover image */}
            <div className="md:w-1/3 lg:w-1/4 p-6 flex justify-center md:block">
              <div className="relative w-48 md:w-full mx-auto md:mx-0">
                <div className="pb-[140%] rounded-lg overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105">
                  <img
                    src={comic.thumbnail}
                    alt={comic.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => (e.target.src = '/api/placeholder/300/300')}
                  />
                </div>
                {comic.rating && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full flex items-center text-sm font-semibold shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    {comic.rating}
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3 lg:w-3/4 p-6 flex flex-col">
              {/* Title and subtitle */}
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100">{comic.title}</h1>
                {comic.info?.alternative_title && (
                  <h2 className="text-lg text-gray-400 mt-1">{comic.info.alternative_title}</h2>
                )}
              </div>

              {/* Statistics */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                  {comic.rating || 'N/A'} / 5
                </div>
                <div className="flex items-center text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {comic.views || 'N/A'} views
                </div>
                <div className="flex items-center text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  {comic.bookmarks || 'N/A'} bookmarks
                </div>
                <div className="flex items-center text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  {chapters.length} chapters
                </div>
              </div>

              {/* Genres */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {comic.genres?.map((genre, index) => (
                    <Chip key={index} className="bg-purple-900 text-purple-300">
                      {genre}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Description with Read More */}
              <div className="mb-6">
                <div className={`prose prose-sm max-w-none ${!expandDescription && 'line-clamp-3'}`}>
                  <p className="text-gray-300">{comic.sinopsis}</p>
                </div>
                <button
                  onClick={() => setExpandDescription(!expandDescription)}
                  className="text-purple-400 font-medium text-sm mt-2 hover:text-purple-300 transition-colors flex items-center"
                  aria-label={expandDescription ? 'Show less description' : 'Read more description'}
                >
                  {expandDescription ? 'Show Less' : 'Read More'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform ${expandDescription ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
                {comic.info && (
                  <>
                    {comic.info.author && (
                      <div>
                        <span className="font-semibold text-gray-400">Author:</span>
                        <span className="ml-2 text-gray-200">{comic.info.author}</span>
                      </div>
                    )}
                    {comic.info.artist && (
                      <div>
                        <span className="font-semibold text-gray-400">Artist:</span>
                        <span className="ml-2 text-gray-200">{comic.info.artist || comic.info.author}</span>
                      </div>
                    )}
                    {comic.info.type && (
                      <div>
                        <span className="font-semibold text-gray-400">Format:</span>
                        <span className="ml-2 text-gray-200">{comic.info.type}</span>
                      </div>
                    )}
                    {comic.info.status && (
                      <div>
                        <span className="font-semibold text-gray-400">Status:</span>
                        <span
                          className={`ml-2 ${
                            comic.info.status.toLowerCase() === 'completed'
                              ? 'text-green-500'
                              : 'text-blue-500'
                          }`}
                        >
                          {comic.info.status}
                        </span>
                      </div>
                    )}
                    {comic.info.released && (
                      <div>
                        <span className="font-semibold text-gray-400">Released:</span>
                        <span className="ml-2 text-gray-200">{comic.info.released}</span>
                      </div>
                    )}
                    {comic.info.updated && (
                      <div>
                        <span className="font-semibold text-gray-400">Updated:</span>
                        <span className="ml-2 text-gray-200">{comic.info.updated}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-auto">
                <Link
                  to={startReading()}
                  className={`flex-1 ${chapters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PrimaryButton
                    className="w-full"
                    disabled={chapters.length === 0}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Start Reading
                  </PrimaryButton>
                </Link>
                <SecondaryButton
                  className="flex-1"
                  isActive={isBookmarked}
                  onClick={toggleBookmark}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d={
                          isBookmarked
                            ? 'M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z'
                            : 'M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4zm2-1a1 1 0 00-1 1v13.5l4-2 4 2V4a1 1 0 00-1-1H7z'
                        }
                      />
                    </svg>
                  }
                >
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </SecondaryButton>
                <SecondaryButton
                  className="flex-1"
                  isActive={inReadlist}
                  onClick={toggleReadlist}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d={
                          inReadlist
                            ? 'M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z'
                            : 'M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z'
                        }
                      />
                    </svg>
                  }
                >
                  {inReadlist ? 'In Readlist' : 'Add to Readlist'}
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`py-4 px-6 font-medium text-center transition-colors duration-200 ${
                  activeTab === 'chapters'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                aria-label="View chapters"
              >
                Chapters
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-6 font-medium text-center transition-colors duration-200 ${
                  activeTab === 'info'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                aria-label="View comic information"
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('novel')}
                className={`py-4 px-6 font-medium text-center transition-colors duration-200 ${
                  activeTab === 'novel'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                aria-label="View novel information"
              >
                Novel
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'chapters' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-100">All Chapters</h2>
                  <span className="bg-purple-900 text-purple-300 text-xs font-medium px-3 py-1 rounded-full">
                    {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>
                <div className="divide-y divide-gray-700">
                  {chapters.length > 0 ? (
                    chapters.map((chapter, index) => (
                      <Link
                        to={`/read/${chapter.slug}`}
                        key={index}
                        className="flex justify-between items-center py-4 hover:bg-gray-700 transition-colors duration-200 group"
                        aria-label={`Read chapter ${chapters.length - index}: ${chapter.title}`}
                      >
                        <div className="font-medium text-gray-200 group-hover:text-purple-400 transition-colors flex items-center">
                          <span className="w-8 h-8 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center text-sm font-semibold mr-3">
                            {chapters.length - index}
                          </span>
                          {chapter.title}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          {chapter.uploaded}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-500 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-gray-400 font-medium">No chapters available yet</p>
                      <p className="text-gray-500 text-sm mt-1">Check back later for updates</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div>
                <h2 className="text-xl font-bold text-gray-100 mb-4">Comic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Details</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      {comic.info && (
                        <>
                          {comic.info.author && (
                            <p>
                              <span className="font-semibold text-gray-400">Author:</span>{' '}
                              {comic.info.author}
                            </p>
                          )}
                          {comic.info.artist && (
                            <p>
                              <span className="font-semibold text-gray-400">Artist:</span>{' '}
                              {comic.info.artist}
                            </p>
                          )}
                          {comic.info.type && (
                            <p>
                              <span className="font-semibold text-gray-400">Format:</span>{' '}
                              {comic.info.type}
                            </p>
                          )}
                          {comic.info.status && (
                            <p>
                              <span className="font-semibold text-gray-400">Status:</span>{' '}
                              {comic.info.status}
                            </p>
                          )}
                          {comic.info.released && (
                            <p>
                              <span className="font-semibold text-gray-400">Released:</span>{' '}
                              {comic.info.released}
                            </p>
                          )}
                          {comic.info.updated && (
                            <p>
                              <span className="font-semibold text-gray-400">Updated:</span>{' '}
                              {comic.info.updated}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {comic.genres?.map((genre, index) => (
                        <Chip key={index}>{genre}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'novel' && (
              <div>
                <h2 className="text-xl font-bold text-gray-100 mb-4">Novel Information</h2>
                <p className="text-gray-400">No novel information available for this comic.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations section */}
        <div className="mt-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-100 mb-4">You Might Also Like</h2>
          {recommendationsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="pb-[140%] relative">
                      <div className="absolute inset-0 bg-gray-700 animate-pulse"></div>
                    </div>
                    <div className="p-3">
                      <div className="h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))}
            </div>
          ) : recommendationsError ? (
            <div className="text-center text-gray-400">
              <p>Failed to load recommendations: {recommendationsError}</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendations.slice(0, 5).map((rec, index) => (
                <ComicCard key={index} comic={rec} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>No recommendations available.</p>
            </div>
          )}
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar closeOnClick />
    </div>
  );
};

export default ComicDetailPage;
