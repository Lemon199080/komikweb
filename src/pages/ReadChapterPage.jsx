import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MangaReaderControls from './MangaReaderControls';

const ReadChapterPage = () => {
  const { chapterSlug } = useParams();
  const navigate = useNavigate();

  // Core state
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chapter list and navigation state
  const [comicSlug, setComicSlug] = useState('');
  const [comicTitle, setComicTitle] = useState('');
  const [chapterList, setChapterList] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [filterText, setFilterText] = useState('');

  // UI visibility state with auto-hide
  const [showUI, setShowUI] = useState(true);
  const uiTimerRef = useRef(null);

  // Reading state
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLoadedImages] = useState({});
  const [imageProgress, setImageProgress] = useState(0);

  // Cache system
  const cacheRef = useRef(new Map());

  // Scroll position tracking
  const lastScrollPosition = useRef(0);
  const contentRef = useRef(null);


  // Extract comic slug from chapter slug
  useEffect(() => {
    if (chapterSlug) {
      const match = chapterSlug.match(/(.+?)-chapter/);
      if (match && match[1]) {
        setComicSlug(match[1]);
      }
    }
    // Reset state when chapter changes
    setCurrentPage(1);
    setLoadedImages({});
    setImageProgress(0);

    // Reset UI visibility
    setShowUI(true);

    // Reset scroll position
    window.scrollTo(0, 0);
  }, [chapterSlug]);

  // Auto-hide UI after period of inactivity
  const resetUiTimer = useCallback(() => {
    if (uiTimerRef.current) {
      clearTimeout(uiTimerRef.current);
    }
    uiTimerRef.current = setTimeout(() => {
      setShowUI(false);
    }, 3000);
  }, []);

  // Handle mouse movement to show UI and reset timer
  const handleMouseMove = useCallback(() => {
    if (!showUI) {
      setShowUI(true);
    }
    resetUiTimer();
  }, [showUI, resetUiTimer]);

  // Set up mouse move event listener
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current);
      }
    };
  }, [handleMouseMove]);

  // Track scroll position for page number calculation
  useEffect(() => {
    const handleScroll = () => {
      if (!chapter?.images?.length) return;

      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollPosition.current ? 'down' : 'up';
      lastScrollPosition.current = scrollY;

      if (scrollDirection === 'down' && scrollY > 100) {
        setShowUI(false);
        if (uiTimerRef.current) {
          clearTimeout(uiTimerRef.current);
        }
      }

      if (contentRef.current) {
        const images = contentRef.current.querySelectorAll('img');
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const rect = img.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
              setCurrentPage(i + 1);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter]);
  
  // Extract chapter number from title or slug - Fixed to handle null chapter
  const extractChapterNumber = () => {
    if (!chapter) return '';
    
    // Try to extract from title first (ensure chapter and chapter.title exist)
    if (chapter.title) {
      const titleMatch = chapter.title.match(/chapter\s+(\d+(?:\.\d+)?)/i);
      if (titleMatch) return titleMatch[1];
    }
    
    // Fall back to slug extraction
    if (chapterSlug) {
      const slugMatch = chapterSlug.match(/chapter-(\d+(?:-\d+)?)/);
      if (slugMatch) {
        return slugMatch[1].replace('-', '.');
      }
    }
    
    return '';
  };

  // Fetch chapter content with caching
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);

        const cacheKey = `${chapterSlug}`;
        if (cacheRef.current.has(cacheKey)) {
          setChapter(cacheRef.current.get(cacheKey));
          setLoading(false);
          return;
        }

        const response = await fetch(`https://api.zeds.rocks/read/${chapterSlug}`);

        console.log('Chapter response headers:', {
          status: response.status,
          contentType: response.headers.get('content-type'),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response for chapter:', text.slice(0, 100));
          throw new Error(`Server returned an invalid response (Status: ${response.status}). Please try again later.`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch chapter data (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log('Chapter response data:', data);

        if (!data.images || data.images.length === 0) {
          throw new Error('No images found for this chapter');
        }

        cacheRef.current.set(cacheKey, data);
        if (cacheRef.current.size > 5) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }

        setChapter(data);
      } catch (err) {
        console.error('Fetch chapter error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (chapterSlug) {
      fetchChapter();
    }
  }, [chapterSlug]);

  // Fetch chapter list for navigation with caching
  useEffect(() => {
    const fetchChapterList = async () => {
      if (!comicSlug) return;

      try {
        const cacheKey = `chapters_${comicSlug}`;
        if (cacheRef.current.has(cacheKey)) {
          const cachedData = cacheRef.current.get(cacheKey);
          setChapterList(cachedData.chapters);
          setCurrentChapterIndex(cachedData.chapters.findIndex((ch) => ch.slug === chapterSlug));
          return;
        }

        const response = await fetch(`https://api.zeds.rocks/comics/${comicSlug}/chapters`);

        console.log('Chapter list response headers:', {
          status: response.status,
          contentType: response.headers.get('content-type'),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response for chapter list:', text.slice(0, 100));
          throw new Error(`Server returned an invalid response for chapter list (Status: ${response.status})`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch chapter list (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log('Chapter list response data:', data);

        const chapters = [...data.chapters].reverse();

        // Also set comic title if available
        if (data.title) {
          setComicTitle(data.title);
        }

        cacheRef.current.set(cacheKey, { chapters });
        setChapterList(chapters);

        const index = chapters.findIndex((ch) => ch.slug === chapterSlug);
        setCurrentChapterIndex(index);
      } catch (err) {
        console.error('Fetch chapter list error:', err.message);
        setError(err.message);
      }
    };

    fetchChapterList();
  }, [comicSlug, chapterSlug]);

  // Handle image loading to track progress
  const handleImageLoad = (index) => {
    setLoadedImages((prev) => {
      const newLoadedImages = { ...prev, [index]: true };
      const loadedCount = Object.keys(newLoadedImages).length;

      if (chapter?.images?.length) {
        const progress = Math.floor((loadedCount / chapter.images.length) * 100);
        setImageProgress(progress);
      }

      return newLoadedImages;
    });
  };

  // Navigation functions
  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapterList[currentChapterIndex - 1];
      navigate(`/read/${prevChapter.slug}`);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapterList.length - 1) {
      const nextChapter = chapterList[currentChapterIndex + 1];
      navigate(`/read/${nextChapter.slug}`);
    }
  };

  const goToChapter = (slug) => {
    navigate(`/read/${slug}`);
    setShowChapterDropdown(false);
  };

  const goToComicPage = () => {
    navigate(`/comic/${comicSlug}`);
  };

  const goToHome = () => {
    navigate('/');
  };

  // Jump to specific page
  const jumpToPage = (pageNum) => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll('img');
      if (images.length >= pageNum) {
        images[pageNum - 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Filter chapters
  const filteredChapters = filterText.trim() !== ''
    ? chapterList.filter((ch) => ch.title.toLowerCase().includes(filterText.toLowerCase()))
    : chapterList;

  // Loading states
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-medium">Loading Chapter...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500"
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
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Error Loading Chapter</h2>
          <p className="text-gray-300 text-center mb-6">{error}</p>
          <div className="flex justify-center flex-wrap gap-2">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Go Home
            </button>
            <button
              onClick={goToComicPage}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Back to Comic
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter || !chapter.images || chapter.images.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">No Images Found</h2>
          <p className="text-gray-300 mb-6">This chapter appears to be empty or unavailable.</p>
          <div className="flex justify-center">
            <button
              onClick={goToComicPage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Comic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get chapter number
  const chapterNumber = extractChapterNumber();

  return (
    <div className="bg-black text-white min-h-screen w-full">
      {/* Redesigned Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-gray-900 to-gray-900/90 backdrop-blur-md transition-transform duration-300 shadow-lg ${
          showUI ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full p-3 md:p-4">
          {/* Header with three columns: Home button, Title/Chapter, Chapter List */}
          <div className="grid grid-cols-3 items-center">
            {/* Left: Home button */}
            <div className="flex items-center justify-start">
              <button
                onClick={goToHome}
                className="group flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 md:w-12 md:h-12 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-blue-500/50"
                aria-label="Go to Home"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>
            </div>
            
            {/* Middle: Comic title and chapter number */}
            <div className="flex flex-col items-center justify-center text-center">
              <button 
                onClick={goToComicPage}
                className="text-xl md:text-2xl font-bold hover:text-blue-400 transition-colors duration-300 truncate max-w-full"
              >
                {comicTitle}
              </button>
              <div className="flex items-center justify-center text-sm md:text-base text-gray-300 mt-1">
                <span className="bg-blue-600 px-2 py-0.5 rounded-full text-white text-xs md:text-sm font-medium">
                  Chapter {chapterNumber}
                </span>
              </div>
            </div>
            
            {/* Right: Chapter dropdown */}
            <div className="flex items-center justify-end space-x-2">
              <div className="relative chapter-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChapterDropdown(!showChapterDropdown);
                  }}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center justify-center transition-colors duration-300"
                >
                  <span className="hidden md:inline">Chapters</span>
                  <svg
                    className="w-4 h-4 md:ml-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {showChapterDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700 rounded-t-lg">
                      <input
                        type="text"
                        placeholder="Find chapter..."
                        className="w-full px-3 py-1.5 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {filteredChapters.map((ch) => (
                        <button
                          key={ch.slug}
                          onClick={() => goToChapter(ch.slug)}
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-700 truncate ${
                            ch.slug === chapterSlug ? 'bg-blue-900 text-white' : 'text-gray-200'
                          }`}
                        >
                          {ch.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const page = prompt(`Go to page (1-${chapter.images.length}):`, currentPage);
                  if (page && !isNaN(page) && page >= 1 && page <= chapter.images.length) {
                    jumpToPage(parseInt(page));
                  }
                }}
                className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-300"
                aria-label="Search pages"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          {imageProgress < 100 && (
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${imageProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Chapter content */}
      <div
        ref={contentRef}
        className={`w-full ${showUI ? 'pt-24 pb-20' : ''} transition-padding duration-300`}
      >
        <div className="flex flex-col items-center">
          {chapter.images.map((image, index) => (
            <div
              key={index}
              className="w-full flex justify-center"
              id={`page-${index + 1}`}
            >
              <img
                src={image}
                alt={`Page ${index + 1}`}
                className="w-full md:max-w-3xl lg:max-w-4xl h-auto"
                loading="lazy"
                onLoad={() => handleImageLoad(index)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23282c34'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14px' fill='%23ffffff'%3EImage Failed to Load%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          ))}
          <div className="w-full max-w-2xl mx-auto text-center py-12 px-4">
            <h3 className="text-xl font-bold mb-4">End of This Chapter</h3>
            <div className="flex flex-wrap justify-center gap-3">
            </div>
          </div>
        </div>
      </div>

      {/* MangaReaderControls */}
      <MangaReaderControls
        showUI={showUI}
        setShowUI={setShowUI}
        resetUiTimer={resetUiTimer}
        goToPreviousChapter={goToPreviousChapter}
        goToNextChapter={goToNextChapter}
        goToComicPage={goToComicPage}
        setShowChapterDropdown={setShowChapterDropdown}
        currentChapterIndex={currentChapterIndex}
        chapterList={chapterList}
      />
</div>
);
};

export default ReadChapterPage;
