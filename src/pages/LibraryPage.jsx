import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComicCard from '../components/ComicCard'; // Adjust the import path based on your file structure

const API_URL = 'http://47.84.51.43:5000';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('Bookmark');
  const [bookmarks, setBookmarks] = useState([]);
  const [readlist, setReadlist] = useState([]);
  const [bookmarkDetails, setBookmarkDetails] = useState([]);
  const [readlistDetails, setReadlistDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to load data from localStorage
  const loadStorageData = () => {
    console.log('Loading storage data');
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const storedReadlist = JSON.parse(localStorage.getItem('readlist') || '[]');
    
    console.log('Loaded bookmarks:', storedBookmarks);
    console.log('Loaded readlist:', storedReadlist);
    
    setBookmarks(storedBookmarks);
    setReadlist(storedReadlist);
  };

  // Load bookmarks and readlist from localStorage on mount
  useEffect(() => {
    loadStorageData();
    
    const handleStorageChange = (e) => {
      console.log('Storage changed:', e);
      if (e.key === 'bookmarks' || e.key === 'readlist' || e.key === null) {
        loadStorageData();
      }
    };
    
    const handleCustomStorageChange = () => {
      console.log('Custom storage event triggered');
      loadStorageData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Fetch comic details for bookmarks and readlist
  useEffect(() => {
    const fetchComicDetails = async (slugs, setDetails) => {
        if (!slugs || slugs.length === 0) {
          setDetails([]);
          return;
        }
      
        setLoading(true);
        setError(null);
      
        try {
          console.log('Fetching details for slugs:', slugs);
          const details = await Promise.all(
            slugs.map(async (slug) => {
              try {
                const response = await axios.get(`${API_URL}/comics/${slug}`);
                console.log(`Comic ${slug} response:`, JSON.stringify(response.data, null, 2));
                const comicData = response.data.data;
                // Log specific fields used by ComicCard
                console.log(`Comic ${slug} fields:`, {
                  slug: comicData.slug,
                  title: comicData.title,
                  thumb: comicData.thumb || comicData.thumbnail,
                  chapter: comicData.chapter,
                  chapterNumber: comicData.chapterNumber,
                  type: comicData.type,
                  status: comicData.status,
                  rating: comicData.rating,
                  country: comicData.country,
                  countryFlag: comicData.countryFlag,
                });
                return comicData;
              } catch (err) {
                console.error(`Failed to fetch comic ${slug} from ${API_URL}:`, err.message);
                try {
                  const fallbackResponse = await axios.get(`http://47.84.51.43:3000/comics/${slug}`);
                  console.log(`Fallback response for ${slug}:`, JSON.stringify(fallbackResponse.data, null, 2));
                  const comicData = fallbackResponse.data.data;
                  console.log(`Fallback comic ${slug} fields:`, {
                    slug: comicData.slug,
                    title: comicData.title,
                    thumb: comicData.thumb || comicData.thumbnail,
                    chapter: comicData.chapter,
                    chapterNumber: comicData.chapterNumber,
                  });
                  return comicData;
                } catch (fallbackErr) {
                  console.error(`Also failed with fallback URL for ${slug}:`, fallbackErr.message);
                  try {
                    const cachedComic = JSON.parse(localStorage.getItem(`comic_${slug}`) || '{}');
                    console.log(`Cached comic for ${slug}:`, JSON.stringify(cachedComic, null, 2));
                    if (cachedComic.data) {
                      return cachedComic.data;
                    }
                    console.warn(`No valid cached data for ${slug}`);
                    return null;
                  } catch (cacheErr) {
                    console.error(`Cache error for ${slug}:`, cacheErr.message);
                    return null;
                  }
                }
              }
            })
          );
      
          const validDetails = details.filter(Boolean);
          console.log('Valid comic details fetched:', validDetails);
          setDetails(validDetails);
        } catch (err) {
          console.error('Failed to fetch comic details:', err);
          setError('Failed to fetch comic details.');
        } finally {
          setLoading(false);
        }
      };

    if (bookmarks.length > 0) {
      fetchComicDetails(bookmarks, setBookmarkDetails);
    } else {
      setBookmarkDetails([]);
    }

    if (readlist.length > 0) {
      fetchComicDetails(readlist, setReadlistDetails);
    } else {
      setReadlistDetails([]);
    }
  }, [bookmarks, readlist]);
  

  // Remove a comic from bookmarks
  const removeFromBookmarks = (slug) => {
    console.log('Removing from bookmarks:', slug);
    const updatedBookmarks = bookmarks.filter((item) => item !== slug);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    window.dispatchEvent(new Event('localStorageChange'));
  };

  // Remove a comic from readlist
  const removeFromReadlist = (slug) => {
    console.log('Removing from readlist:', slug);
    const updatedReadlist = readlist.filter((item) => item !== slug);
    setReadlist(updatedReadlist);
    localStorage.setItem('readlist', JSON.stringify(updatedReadlist));
    window.dispatchEvent(new Event('localStorageChange'));
  };

  // Render comic card using ComicCard component
  const renderComicCard = (comic, removeHandler) => {
    if (!comic) return null;
    console.log(`Rendering comic ${comic.slug}:`, comic);
    return (
      <motion.div
        key={comic.slug}
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <ComicCard comic={comic} viewMode="grid" />
        <button
          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          onClick={(e) => {
            e.stopPropagation();
            removeHandler(comic.slug);
          }}
        >
          ✕
        </button>
      </motion.div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Bookmark':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full px-4 pt-4"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <svg
                  className="animate-spin h-8 w-8 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>{error}</p>
              </div>
            ) : bookmarks.length > 0 ? (
              bookmarkDetails.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-6">
                  {bookmarkDetails.map((comic) => renderComicCard(comic, removeFromBookmarks))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <p>Loading bookmark data...</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p>No bookmarks yet. Start adding some comics!</p>
                <p className="mt-2 text-sm">Bookmark count: {bookmarks.length}</p>
              </div>
            )}
          </motion.div>
        );
      case 'Readlist':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full px-4 pt-4"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <svg
                  className="animate-spin h-8 w-8 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p>{error}</p>
              </div>
            ) : readlist.length > 0 ? (
              readlistDetails.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-6">
                  {readlistDetails.map((comic) => renderComicCard(comic, removeFromReadlist))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <p>Loading readlist data...</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>Your readlist is empty. Add some comics to read later!</p>
                <p className="mt-2 text-sm">Readlist count: {readlist.length}</p>
              </div>
            )}
          </motion.div>
        );
      case 'History':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-64 text-gray-400"
          >
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No reading history available.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="flex border-b border-gray-800 sticky top-0 bg-black z-10">
        {['Bookmark', 'Readlist', 'History'].map((tab) => (
          <button
            key={tab}
            className={`w-1/3 py-4 text-center font-medium transition-colors duration-200 relative ${
              activeTab === tab ? 'text-purple-500' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"
                layoutId="underline"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <div className="flex-1 overflow-y-auto pb-12">{renderTabContent()}</div>
      </AnimatePresence>

      <div className="py-4 text-center text-gray-500 text-xs">
        <p>© 2024 Izanami. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LibraryPage;